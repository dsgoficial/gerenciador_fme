'use strict'

const Joi = require('joi')

const models = {}

models.uuidParams = Joi.object().keys({
  uuid: Joi.string()
    .guid({ version: 'uuidv4' })
    .required()
})

models.paginacaoQuery = Joi.object().keys({
  pagina: Joi.number().integer().min(1),
  total_pagina: Joi.number().integer().min(5),
  coluna_ordem: Joi.string().allow(''),
  direcao_ordem: Joi.string().valid('asc', 'desc', ''),
  filtro: Joi.string().allow('')
})

module.exports = models
