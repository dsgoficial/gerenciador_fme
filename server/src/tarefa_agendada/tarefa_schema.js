'use strict'

const Joi = require('joi')

const models = {}

models.idParams = Joi.object().keys({
  id: Joi.number().integer()
    .required()
})

models.tarefa = Joi.object().keys({
  configuracao: Joi.string().required(),
  rotina_id: Joi.number().integer()
    .required(),
  parametros: Joi.object(),
  tipo: Joi.string().required().valid('cron', 'data')
})

module.exports = models
