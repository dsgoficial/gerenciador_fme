'use strict'

const Queue = require('better-queue')
const fs = require('fs')
const util = require('util')
const path = require('path')

const unlink = util.promisify(fs.unlink)

const { db } = require('../database')

const getParams = require('./rotina_parse')

const fmeRunner = require('./rotina_runner')

const { AppError, httpCode, errorHandler } = require('../utils')

const controller = {}

controller.criaVersao = async (rotinaId, path, uuid) => {
  await db.conn.tx(async t => {
    const usuario = await t.one(
      `
        SELECT id FROM dgeo.usuario WHERE uuid = $<uuid>
      `,
      { uuid }
    )

    const versao = await t.one(
      `
      INSERT INTO fme.versao_rotina(rotina_id, nome, data, usuario_id, path)
      SELECT $<rotinaId> AS rotina_id, vr.nome + 1 AS nome, CURRENT_TIMESTAMP AS data, $<usuarioId> AS usuario_id, $<path> AS path
      FROM fme.versao_rotina AS vr
      WHERE vr.rotina_id = $<rotinaId>
      ORDER BY vr.nome DESC
      LIMIT 1
      RETURNING id
      `,
      { rotinaId, usuarioId: usuario.id, path }
    )

    const params = await getParams(path)
    const queries = []
    params.forEach(p => {
      queries.push(
        t.none(
          `
          INSERT INTO fme.parametros(versao_rotina_id, nome)
          VALUES($<versaoId>, $<p>)
          `,
          { versaoId: versao.id, p }
        )
      )
    })
    return t.batch(queries)
  })
}

const jobQueue = new Queue(
  async (input, cb) => {
    try {
      const summary = await fmeRunner(
        input.path,
        input.parametros
      )
      cb(null, summary)
    } catch (err) {
      cb(err, null)
    }
  },
  { concurrent: 3 }
)

const updateJob = async (uuid, status, time, log) => {
  return db.conn.none(
    `
    UPDATE fme.execucao SET status = $<status>, tempo_execucao = $<time>,
    log = $<log:json>
    WHERE uuid = $<uuid>
    `,
    { status, time, log, uuid }
  )
}

jobQueue.on('task_finish', (taskId, result, stats) => {
  updateJob(taskId, 2, stats.elapsed, result)
})

jobQueue.on('task_failed', function (taskId, err, stats) {
  errorHandler(err)
  updateJob(taskId, 3, stats.elapsed, null)
})

controller.execucaoRotina = async (id, uuid, parametros) => {
  const versao = await db.conn.one(
    `
      SELECT id, rotina_id, path FROM fme.versao_rotina WHERE id = $<id>
      `,
    { id }
  )

  await db.conn.none(
    `
      INSERT INTO fme.execucao(uuid, status_id, versao_rotina_id, rotina_id, data_execucao, parametros)
      VALUES($<uuid>,1,$<versaoId>,$<rotinaId>, CURRENT_TIMESTAMP, $<parametros:json>)
      `,
    { uuid, versaoId: versao.id, rotinaId: versao.rotina_id, parametros }
  )

  jobQueue.push({ id: uuid, path: versao.path, parametros })
}

controller.getVersoes = async () => {
  const versoes = await db.conn.any(
    `
      SELECT vr.id, vr.path, vr.nome AS versao, vr.usuario_id, COALESCE(tpg.nome_abrev || ' ' || u.nome_guerra, 'Usuário deletado') AS usuario,
      vr.data, r.nome AS rotina, c.nome AS categoria, r.ativa, vr.rn = 1 AS atual,
      array_agg(p.nome ORDER BY p.nome) AS parametros
      FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY rotina_id ORDER BY data DESC) rn FROM fme.versao_rotina) AS vr
      INNER JOIN fme.rotina AS r ON vr.rotina_id = r.id
      INNER JOIN fme.categoria AS c ON c.id = r.categoria_id
      LEFT JOIN fme.parametros AS p ON p.versao_rotina_id = vr.id
      LEFT JOIN dgeo.usuario AS u ON u.id = vr.usuario_id
      LEFT JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      GROUP BY vr.id, vr.path, vr.nome, vr.usuario_id, vr.data, r.nome, c.nome, r.ativa, tpg.nome_abrev, u.nome_guerra, vr.rn
      `
  )
  versoes.forEach(v => {
    v.path = 'fme/' + v.path.split('\\').pop()
  })

  return versoes
}

controller.deletarVersao = async id => {
  await db.conn.tx(async t => {
    const versao = await t.oneOrNone(
      `SELECT path FROM fme.versao_rotina 
      WHERE id = $<id>`,
      { id }
    )
    if (!versao) {
      throw new AppError('Versão não encontrada', httpCode.BadRequest)
    }

    await t.none(
      `UPDATE fme.execucao
      SET versao_rotina_id = NULL
      WHERE versao_rotina_id = $<id>`,
      { id }
    )

    await t.none(
      `DELETE FROM fme.parametros 
      WHERE versao_rotina_id = $<id>`,
      { id }
    )

    await t.none(
      `DELETE FROM fme.versao_rotina 
      WHERE id = $<id>`,
      { id }
    )

    await unlink(path.resolve(versao.path))
  })
}

controller.atualizaRotina = async (id, nome, descricao, categoriaId, ativa) => {
  const rotinaExists = await db.conn.oneOrNone('SELECT id FROM fme.rotina WHERE nome = $<nome> AND id != $<id>', { id, nome })

  if (rotinaExists) {
    throw new AppError('Rotina com esse nome já existe', httpCode.BadRequest)
  }

  const result = await db.conn.result(
    `UPDATE fme.rotina SET nome = $<nome>, descricao = $<descricao>, 
    categoria_id = $<categoriaId>, ativa = $<ativa> WHERE id = $<id>`,
    { id, nome, descricao, categoriaId, ativa }
  )
  if (!result.rowCount || result.rowCount !== 1) {
    throw new AppError('Rotina não encontrada', httpCode.BadRequest)
  }
}

controller.deletaRotina = async id => {
  await db.conn.tx(async t => {
    const rotina = await t.any(
      `SELECT id FROM fme.rotina 
      WHERE id = $<id>`,
      { id }
    )
    if (!rotina) {
      throw new AppError('Rotina não encontrada', httpCode.BadRequest)
    }

    const versoes = await t.any(
      `SELECT path FROM fme.versao_rotina 
      WHERE rotina_id = $<id>`,
      { id }
    )

    await t.none(
      `UPDATE fme.execucao
      SET rotina_id = NULL, versao_rotina_id = NULL
      WHERE rotina_id = $<id>`,
      { id }
    )

    await t.none(
      `DELETE FROM fme.parametros 
      WHERE versao_rotina_id IN (
        SELECT id FROM fme.versao_rotina
        WHERE rotina_id =  $<id>
      )`,
      { id }
    )

    await t.none(
      `DELETE FROM fme.versao_rotina 
      WHERE rotina_id =  $<id>`,
      { id }
    )

    await t.none(
      `DELETE FROM fme.rotina 
      WHERE id =  $<id>`,
      { id }
    )

    await Promise.all(versoes.map(v => unlink(path.resolve(v.path))))
  })
}

controller.getRotinas = async (ids, categoria) => {
  let rotinas = await db.conn.any(
    `
      SELECT vr.id AS versao_id, vr.path, vr.nome AS versao, vr.usuario_id, COALESCE(tpg.nome_abrev || ' ' || u.nome_guerra, 'Usuário deletado') AS usuario,
      vr.data, r.id, r.nome AS rotina, r.descricao, c.id AS categoria_id, c.nome AS categoria, r.ativa,
      array_agg(p.nome ORDER BY p.nome) AS parametros
      FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY rotina_id ORDER BY data DESC) rn FROM fme.versao_rotina) AS vr
      INNER JOIN fme.rotina AS r ON vr.rotina_id = r.id
      INNER JOIN fme.categoria AS c ON c.id = r.categoria_id
      LEFT JOIN fme.parametros AS p ON p.versao_rotina_id = vr.id
      LEFT JOIN dgeo.usuario AS u ON u.id = vr.usuario_id
      LEFT JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      WHERE vr.rn = 1 
      GROUP BY r.id, c.id, c.nome, vr.id, vr.path, vr.nome, vr.usuario_id, vr.data, r.nome, c.nome, r.ativa, u.nome_guerra, tpg.nome_abrev
      `,
    { ids, categoria }
  )

  if (ids && ids.length > 0) {
    rotinas = rotinas.filter(v => {
      return ids.indexOf(v.id) !== -1
    })
  }
  if (categoria) {
    rotinas = rotinas.filter(v => {
      return parseInt(categoria, 10) === parseInt(v.categoria_id, 10)
    })
  }

  rotinas.forEach(v => {
    v.path = 'fme/' + v.path.split('\\').pop()
  })

  return rotinas
}

controller.criaRotina = async (path, uuid, nome, descricao, categoriaId) => {
  await db.conn.tx(async t => {
    const params = await getParams(path)

    const rotinaExists = await t.oneOrNone('SELECT id FROM fme.rotina WHERE nome = $<nome>', { nome })

    if (rotinaExists) {
      throw new AppError('Rotina com esse nome já existe', httpCode.BadRequest)
    }

    const rotina = await t.one(
      `
        INSERT INTO fme.rotina(nome, descricao, categoria_id)
        VALUES($<nome>, $<descricao>, $<categoriaId>) RETURNING id
        `,
      { nome, descricao, categoriaId }
    )

    const usuario = await t.one(
      `
        SELECT id FROM dgeo.usuario WHERE uuid = $<uuid>
      `,
      { uuid }
    )

    const versao = await t.one(
      `
      INSERT INTO fme.versao_rotina(rotina_id, nome, data, usuario_id, path)
      VALUES($<rotinaId>, 1, CURRENT_TIMESTAMP, $<usuarioId>, $<path>) RETURNING id
      `,
      { rotinaId: rotina.id, usuarioId: usuario.id, path }
    )

    const queries = []
    params.forEach(pa => {
      queries.push(
        t.none(
          `
          INSERT INTO fme.parametros(versao_rotina_id, nome)
          VALUES($<versaoId>, $<pa>)
          `,
          { versaoId: versao.id, pa }
        )
      )
    })
    return t.batch(queries)
  })
}

module.exports = controller
