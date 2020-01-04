'use strict'

const Joi = require('joi')

const models = {}

models.totalQuery = Joi.object().keys({
  total: Joi.number()
    .integer()
})

models.totalMaxQuery = Joi.object().keys({
  total: Joi.number()
    .integer(),
  max: Joi.number()
    .integer()
})

module.exports = models
