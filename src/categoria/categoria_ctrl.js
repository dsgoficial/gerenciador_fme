'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.get = async () => {
  return db.conn.one('SELECT id, name FROM fme.category')
}

controller.create = async nome => {
  return db.conn.none('INSERT INTO fme.category(name) VALUES($<nome>)', {
    nome
  })
}

controller.update = async (id, nome) => {
  const result = db.conn.result(
    'UPDATE fme.category SET name = $<nome> WHERE id = $<id>',
    {
      id,
      nome
    }
  )

  if (!result.rowCount || result.rowCount !== 1) {
    throw new AppError('Categoria não encontrada', httpCode.BadRequest)
  }
}

controller.delete = async id => {
  const result = db.conn.result('DELETE FROM fme.category WHERE id = $<id>', {
    id
  })

  if (!result.rowCount || result.rowCount !== 1) {
    throw new AppError('Categoria não encontrada', httpCode.BadRequest)
  }
}

module.exports = controller
