'use strict'

const { db } = require('../database')

const controller = {}

controller.get = async () => {
  return db.conn.any('SELECT id, name FROM fme.user')
}

module.exports = controller
