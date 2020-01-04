'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.string()
    .regex(/^[0-9]+$/)
    .required()
})

models.categoria = Joi.object().keys({
  nome: Joi.string().required(),
  descricao: Joi.string().allow('').required()
})

module.exports = models
