'use strict'

const Queue = require('better-queue')
const fs = require('fs')
const util = require('util')

const unlink = util.promisify(fs.unlink)

const { db } = require('../database')

const getParams = require('./rotina_parse')

const fmeRunner = require('./rotina_runner')

const { AppError, httpCode, errorHandler } = require('../utils')

const controller = {}

controller.criaVersao = async (id, path, uuid) => {
  await db.conn.tx(async t => {
    const params = await getParams(path)

    const usuario = await t.one(
      `
        SELECT id FROM dgeo.usuario WHERE uuid = $<uuid>
      `,
      { uuid }
    )

    const versao = await t.one(
      `
      INSERT INTO versao_rotina(rotina_id, nome, data, usuario_id, path)
      SELECT $<rotinaId> AS rotina_id, vr.nome + 1 AS nome, CURRENT_TIMESTAMP AS data, $<usuarioId> AS usuario_id, $<path> AS path
      FROM versao_rotina AS vr
      WHERE vr.rotina_id = $<rotinaId>
      ORDER BY vr.nome DESC
      LIMIT 1
      RETURNING id
      `,
      { id, usuarioId: usuario.id, path }
    )

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
  const versoes = db.conn.any(
    `
      SELECT vr.id, vr.path, vr.nome AS versao, COALESCE(vr.usuario_id, 'Usuário deletado') AS autor,
      vr.data, r.nome AS rotina, c.nome AS categoria, r.ativa,
      json_agg(p.nome ORDER BY p.nome) AS parametros
      FROM fme.versao_rotina AS vr
      INNER JOIN fme.rotina AS r ON vr.rotina_id = r.id
      INNER JOIN fme.categoria AS c ON c.id = r.categoria_id
      LEFT JOIN fme.parametros AS p ON p.versao_rotina_id = vr.id
      GROUP BY vr.id, vr.path, vr.nome, vr.usuario_id, vr.data, r.nome, c.nome, r.ativa
      `
  )
  versoes.forEach(v => {
    v.path = 'fme/' + v.path.split('\\').pop()
  })

  return versoes
}

controller.deletarVersao = async id => {
  await db.conn.tx(async t => {
    const versao = t.oneOrNone(
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
      `DELETE FROM fme.versao_rotina 
      WHERE id = $<id>`,
      { id }
    )

    await unlink(versao.path)
  })
}

controller.atualizaRotina = async (id, nome, descricao, categoriaId, ativa) => {
  const result = db.conn.result(
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
    const rotina = t.any(
      `SELECT id FROM fme.rotina 
      WHERE id = $<id>`,
      { id }
    )
    if (!rotina) {
      throw new AppError('Rotina não encontrada', httpCode.BadRequest)
    }

    const versoes = t.any(
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
      `DELETE FROM fme.versao_rotina 
      WHERE rotina_id =  $<id>`,
      { id }
    )

    await t.none(
      `DELETE FROM fme.rotina 
      WHERE id =  $<id>`,
      { id }
    )

    await Promise.all(versoes.map(v => unlink(v.path)))
  })
}

controller.getRotinas = async (ids, categoria) => {
  t.any(
    `
    SELECT v.id, w.id AS workspace_id, w.name AS workspace_name, w.description AS workspace_description, v.name AS version_name, v.version_date AS version_date,
    COALESCE(v.author, 'Usuário deletado') AS version_author, v.workspace_path, v.accessible, c.id AS category_id, c.name AS category_name
    FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY workspace_id ORDER BY version_date DESC) rn FROM fme.workspace_version WHERE accessible = TRUE) AS v
    INNER JOIN fme.workspace AS w ON v.workspace_id = w.id
    INNER JOIN fme.category AS c ON c.id = w.category_id
    WHERE v.rn = 1
    `
  )
}

controller.criaRotina = async (path, uuid, nome, descricao, categoria) => {
  await db.conn.tx(async t => {
    const params = await getParams(path)

    const rotina = await t.one(
      `
        INSERT INTO fme.rotina(nome, descricao, categoria)
        VALUES($<nome>,$<descricao>,$<categoria) RETURNING id
        `,
      { nome, descricao, categoria }
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
      VALUES($<rotinaId>,1,CURRENT_TIMESTAMP,$<usuarioId>,$<path>) RETURNING id
      `,
      { rotinaId: rotina.id, usuarioId: usuario.id, path }
    )

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

module.exports = controller
