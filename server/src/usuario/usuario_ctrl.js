'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const { getUsuariosAuth } = require('../authentication')

const controller = {}

controller.getUsuarios = async () => {
  return db.conn.any(`
  SELECT u.uuid, u.login, u.nome, u.tipo_posto_grad_id, tpg.nome_abrev AS tipo_posto_grad, u.nome_guerra, u.administrador, u.ativo 
  FROM dgeo.usuario AS u
  INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
  `)
}

controller.atualizaUsuario = async (uuid, administrador, ativo) => {
  const result = await db.conn.result(
    'UPDATE dgeo.usuario SET administrador = $<administrador>, ativo = $<ativo> WHERE uuid = $<uuid>',
    {
      uuid,
      administrador,
      ativo
    }
  )

  if (!result.rowCount || result.rowCount !== 1) {
    throw new AppError('Usuário não encontrado', httpCode.BadRequest)
  }
}

controller.deletaUsuario = async uuid => {
  return db.conn.tx(async t => {
    const adm = await t.oneOrNone(
      `SELECT uuid FROM dgeo.usuario 
      WHERE uuid = $<uuid> AND administrador IS TRUE `,
      { uuid }
    )

    if (adm) {
      throw new AppError('Usuário com privilégio de administrador não pode ser deletado', httpCode.BadRequest)
    }

    await t.none(
      `UPDATE fme.versao_rotina
      SET usuario_id = NULL
      WHERE usuario_id IN
      (SELECT id FROM dgeo.usuario WHERE uuid = $<uuid>)`,
      { uuid }
    )

    await t.none(
      `UPDATE fme.tarefa_agendada_data
      SET usuario_id = NULL
      WHERE usuario_id IN
      (SELECT id FROM dgeo.usuario WHERE uuid = $<uuid>)`,
      { uuid }
    )

    await t.none(
      `UPDATE fme.tarefa_agendada_cron
      SET usuario_id = NULL
      WHERE usuario_id IN
      (SELECT id FROM dgeo.usuario WHERE uuid = $<uuid>)`,
      { uuid }
    )

    const result = await t.result(
      'DELETE FROM dgeo.usuario WHERE uuid = $<uuid>',
      { uuid }
    )
    if (!result.rowCount || result.rowCount < 1) {
      throw new AppError('Usuário não encontrado', httpCode.NotFound)
    }
  })
}

controller.getUsuariosAuthServer = async cadastrados => {
  const usuariosAuth = await getUsuariosAuth()

  const usuarios = await db.conn.any('SELECT u.uuid FROM dgeo.usuario AS u')

  return usuariosAuth.filter(u => {
    return usuarios.map(r => r.uuid).indexOf(u.uuid) === -1
  })
}

controller.atualizaListaUsuarios = async () => {
  const usuariosAuth = await getUsuariosAuth()

  const cs = new db.pgp.helpers.ColumnSet(['?uuid', 'login', 'nome', 'nome_guerra', 'tipo_posto_grad_id'])

  const query =
    db.pgp.helpers.update(usuariosAuth, cs, { table: 'usuario', schema: 'dgeo' }, {
      tableAlias: 'X',
      valueAlias: 'Y'
    }) + 'WHERE Y.uuid::uuid = X.uuid'

  return db.conn.none(query)
}

controller.criaListaUsuarios = async usuarios => {
  const usuariosAuth = await getUsuariosAuth()

  const usuariosFiltrados = usuariosAuth.filter(f => {
    return usuarios.indexOf(f.uuid) !== -1
  })

  const cs = new db.pgp.helpers.ColumnSet(
    [
      'uuid',
      'login',
      'nome',
      'nome_guerra',
      'tipo_posto_grad_id',
      { name: 'ativo', init: () => true },
      { name: 'administrador', init: () => false }
    ]
  )

  const query = db.pgp.helpers.insert(usuariosFiltrados, cs, { table: 'usuario', schema: 'dgeo' })

  return db.conn.none(query)
}

module.exports = controller
