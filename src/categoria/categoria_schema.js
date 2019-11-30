"use strict";

const Joi = require("joi");

const models = {};

models.idParams = Joi.object().keys({
  id: Joi.string()
    .regex(/^[0-9]+$/)
    .required()
});

models.category = Joi.object().keys({
  name: Joi.string().required()
});

module.exports = models;
