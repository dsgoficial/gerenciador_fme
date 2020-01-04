'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getUsuarios = async () => {
  return db.conn.any(`
  SELECT u.uuid, u.login, u.nome, u.tipo_posto_grad.id, tpg.nome_abrev AS posto_grad, u.nome_guerra, u.administrador, u.ativo FROM dgeo.usuario AS u
  INNER JOIN dominio.tipo_posto_grad AS tpg.code = u.tipo_posto_grad_id

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
      (SELECT id FROM dgeo.usuario WHERE uuid = $<uuid> AND administrador IS FALSE)`,
      { uuid }
    )
    const result = await t.result(
      'DELETE FROM dgeo.usuario WHERE uuid = $<uuid> AND administrador IS FALSE',
      { uuid }
    )
    if (!result.rowCount || result.rowCount < 1) {
      throw new AppError('Usuário não encontrado', httpCode.NotFound)
    }
  })
}

controller.atualizaListaUsuarios = async usuarios => {
  const table = new db.pgp.helpers.TableName({
    table: 'usuario',
    schema: 'dgeo'
  })

  const cs = new db.pgp.helpers.ColumnSet(['?uuid', 'login', 'nome', 'nome_guerra', 'tipo_posto_grad_id'], { table })

  const query =
    db.pgp.helpers.update(usuarios, cs, null, {
      tableAlias: 'X',
      valueAlias: 'Y'
    }) + 'WHERE Y.uuid = X.uuid'

  return db.conn.none(query)
}

controller.criaListaUsuarios = async usuarios => {
  const table = new db.pgp.helpers.TableName({
    table: 'usuario',
    schema: 'dgeo'
  })

  const cs = new db.pgp.helpers.ColumnSet(
    [
      'uuid',
      'login',
      'nome',
      'nome_guerra',
      'tipo_posto_grad_id',
      'ativo',
      'administrador'
    ],
    { table }
  )

  usuarios.foreach(d => {
    d.ativo = true
    d.administrador = false
  })

  const query = db.pgp.helpers.insert(usuarios, cs)

  db.conn.none(query)
}

module.exports = controller
