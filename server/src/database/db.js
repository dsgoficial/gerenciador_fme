'use strict'

const {
  errorHandler,
  config: { DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT, DB_NAME }
} = require('../utils')

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
    .then(function (obj) {
      obj.done() // success, release connection;
    })
    .catch(errorHandler)

  db.conn = conn
}

module.exports = db
