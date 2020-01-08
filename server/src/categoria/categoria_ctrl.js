'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.get = async () => {
  return db.conn.any('SELECT id, nome, descricao FROM fme.categoria')
}

controller.insert = async (nome, descricao) => {
  const categoria = await db.conn.oneOrNone('SELECT id FROM fme.categoria WHERE nome = $<nome>', { nome })

  if (categoria) {
    throw new AppError('Categoria com esse nome já existe', httpCode.BadRequest)
  }

  return db.conn.none('INSERT INTO fme.categoria(nome, descricao) VALUES($<nome>, $<descricao>)', {
    nome,
    descricao
  })
}

controller.update = async (id, nome, descricao) => {
  const categoria = await db.conn.oneOrNone('SELECT id FROM fme.categoria WHERE nome = $<nome> AND id != $<id>', { id, nome })

  if (categoria) {
    throw new AppError('Categoria com esse nome já existe', httpCode.BadRequest)
  }

  const result = await db.conn.result(
    'UPDATE fme.categoria SET nome = $<nome>, descricao = $<descricao> WHERE id = $<id>',
    {
      id,
      nome,
      descricao
    }
  )

  if (!result.rowCount || result.rowCount !== 1) {
    throw new AppError('Categoria não encontrada', httpCode.BadRequest)
  }
}

controller.delete = async id => {
  return db.conn.tx(async t => {
    const rotina = await t.oneOrNone('SELECT id FROM fme.rotina WHERE categoria_id = $<id> LIMIT 1', { id })

    if (rotina) {
      throw new AppError('A categoria possui rotinas associadas, não podendo ser deletada.', httpCode.BadRequest)
    }

    const result = await t.result('DELETE FROM fme.categoria WHERE id = $<id>', {
      id
    })

    if (!result.rowCount || result.rowCount !== 1) {
      throw new AppError('Categoria não encontrada', httpCode.BadRequest)
    }
  })
}

module.exports = controller
