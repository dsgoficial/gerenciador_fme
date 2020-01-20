'use strict'

const Joi = require('joi')

const models = {}

models.uuidParams = Joi.object().keys({
  uuid: Joi.string()
    .guid({ version: 'uuidv4' })
    .required()
})

models.tarefaData = Joi.object().keys({
  nome: Joi.string().required(),
  configuracao: Joi.string().required(),
  rotina_id: Joi.number().integer()
    .required(),
  parametros: Joi.object()
})

models.tarefaCron = Joi.object().keys({
  nome: Joi.string().required(),
  configuracao: Joi.string().required(),
  rotina_id: Joi.number().integer()
    .required(),
  parametros: Joi.object(),
  data_inicio: Joi.date().allow(null),
  data_fim: Joi.date().allow(null)
})

module.exports = models
