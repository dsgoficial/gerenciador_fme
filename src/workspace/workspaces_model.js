"use strict";

const Joi = require("joi");

const workspace = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category_id: Joi.number()
    .integer()
    .required()
});

module.exports.workspace = workspace;

const workspaceVersion = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  category_id: Joi.number()
    .integer()
    .required(),
  version_name: Joi.string().required(),
  version_author: Joi.number().integer().required(),
  version_date: Joi.date()
});

module.exports.workspaceVersion = workspaceVersion;

const version = Joi.object().keys({
  version_name: Joi.string().required(),
  version_author: Joi.number().integer().required(),
  version_date: Joi.date()
});

module.exports.version = version;
