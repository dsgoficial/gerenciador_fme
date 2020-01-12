'use strict'

const fs = require('fs')
const util = require('util')
const path = require('path')

const unlink = util.promisify(fs.unlink)

const jobQueue = require('../queue')

const { db } = require('../database')

const getParams = require('./rotina_parse')

const { AppError, httpCode } = require('../utils')

const { PATH_WORKSPACES } = require('../config')

const controller = {}

controller.criaVersao = async (rotinaId, rotinaPath, uuid) => {
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
      SELECT $<rotinaId> AS rotina_id, vr.nome + 1 AS nome, CURRENT_TIMESTAMP AS data, $<usuarioId> AS usuario_id, $<rotinaPath> AS path
      FROM fme.versao_rotina AS vr
      WHERE vr.rotina_id = $<rotinaId>
      ORDER BY vr.nome DESC
      LIMIT 1
      RETURNING id
      `,
      { rotinaId, usuarioId: usuario.id, rotinaPath: rotinaPath.split(path.sep).pop() }
    )

    const params = await getParams(rotinaPath)
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

controller.execucaoRotina = async (id, uuid, parametros) => {
  const versao = await db.conn.one(
    `
    SELECT r.id AS rotina_id, vr.id AS versao_id, vr.path
    FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY rotina_id ORDER BY data DESC) rn FROM fme.versao_rotina) AS vr
    INNER JOIN fme.rotina AS r ON vr.rotina_id = r.id
    WHERE vr.rn = 1 AND r.ativa IS TRUE
      `,
    { id }
  )

  await db.conn.none(
    `
      INSERT INTO fme.execucao(uuid, status_id, versao_rotina_id, rotina_id, data_execucao, parametros)
      VALUES($<uuid>,1,$<versaoId>,$<rotinaId>, CURRENT_TIMESTAMP, $<parametros:json>)
      `,
    { uuid, versaoId: versao.versao_id, rotinaId: versao.rotina_id, parametros }
  )

  jobQueue.push({ id: uuid, rotinaPath: versao.path, parametros })
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
    v.path = 'api/fme/' + v.path
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

    await unlink(path.join(PATH_WORKSPACES, versao.path))
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

    await Promise.all(versoes.map(v => unlink(path.join(PATH_WORKSPACES, v.path))))
  })
}
controller.getRotinas = async (ids, categoria) => {
  let rotinas = await db.conn.any(
    `
      SELECT vr.nome AS versao, vr.data, r.id, r.nome AS rotina, r.descricao, c.nome AS categoria,
      array_agg(p.nome ORDER BY p.nome) AS parametros
      FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY rotina_id ORDER BY data DESC) rn FROM fme.versao_rotina) AS vr
      INNER JOIN fme.rotina AS r ON vr.rotina_id = r.id
      INNER JOIN fme.categoria AS c ON c.id = r.categoria_id
      LEFT JOIN fme.parametros AS p ON p.versao_rotina_id = vr.id
      LEFT JOIN dgeo.usuario AS u ON u.id = vr.usuario_id
      LEFT JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
      WHERE vr.rn = 1 AND r.ativa IS TRUE
      GROUP BY vr.nome, vr.data, r.id, r.nome, r.descricao, c.nome
      `
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

  return rotinas
}

controller.getRotinasCompleto = async () => {
  const rotinas = await db.conn.any(
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
      `
  )

  rotinas.forEach(v => {
    v.path = 'api/fme/' + v.path
  })

  return rotinas
}

controller.criaRotina = async (rotinaPath, uuid, nome, descricao, categoriaId) => {
  await db.conn.tx(async t => {
    const params = await getParams(rotinaPath)

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
      VALUES($<rotinaId>, 1, CURRENT_TIMESTAMP, $<usuarioId>, $<rotinaPath>) RETURNING id
      `,
      { rotinaId: rotina.id, usuarioId: usuario.id, rotinaPath: rotinaPath.split(path.sep).pop() }
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
