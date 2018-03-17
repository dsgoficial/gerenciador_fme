const settings = require('../config.json')
const promise = require('bluebird')

const options = {
  // Initialization Options
  promiseLib: promise,
}
const pgp = require('pg-promise')(options)
const db = pgp(settings.connectionString)

module.exports = db