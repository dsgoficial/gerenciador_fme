"use strict";

const Joi = require("joi");

const models = {};

models.workspace = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category_id: Joi.number()
    .integer()
    .required()
});

models.workspaceVersion = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category_id: Joi.number()
    .integer()
    .required(),
  version_name: Joi.string().required(),
  version_author_id: Joi.number()
    .integer()
    .required(),
  version_date: Joi.date()
});

models.version = Joi.object().keys({
  version_name: Joi.string().required(),
  version_author: Joi.number()
    .integer()
    .required(),
  version_date: Joi.date(),
  accessible: Joi.boolean()
});

models.jobParameters = Joi.object().keys({
  parameters: Joi.object()
});

module.exports = models;
