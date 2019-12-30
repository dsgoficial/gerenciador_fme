'use strict'

const Joi = require('joi')

const models = {}

models.login = Joi.object().keys({
  usuario: Joi.string().required(),
  senha: Joi.string().required()
})

module.exports = models
