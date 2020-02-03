'use strict'

const { errorHandler } = require('../utils')

const { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_NAME } = require('../config')

const promise = require('bluebird')

const db = {}

db.pgp = require('pg-promise')({
  promiseLib: promise
})

db.createConn = async () => {
  const cn = {
    host: DB_SERVER,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD
  }
  const conn = db.pgp(cn)

  await conn
    .connect()
    .then(obj => {
      obj.done() // success, release connection;
    })
    .catch(errorHandler.critical)

  db.conn = conn
}

module.exports = db
