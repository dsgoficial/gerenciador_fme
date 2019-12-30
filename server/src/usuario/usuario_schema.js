'use strict'

const Joi = require('joi')

const models = {}

models.user = Joi.object().keys({
  name: Joi.string().required()
})

module.exports = models
