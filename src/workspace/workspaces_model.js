"use strict";

const Joi = require("joi");

const workspace = Joi.object().keys({
  name: Joi.string()
    .alphanum()
    .min(1)
    .max(255)
    .required(),
  description: Joi.string().required(),
  category_id: Joi.number()
    .integer()
    .required()
});

module.exports.workspace = workspace;

const workspaceVersion = Joi.object().keys({
  name: Joi.string()
    .alphanum()
    .min(1)
    .max(255)
    .required(),
  description: Joi.string().required(),
  category_id: Joi.number()
    .integer()
    .required(),
  version_name: Joi.string()
    .alphanum()
    .min(1)
    .max(255)
    .required(),
  version_author: Joi.string()
    .alphanum()
    .min(1)
    .max(255)
    .required(),
  version_date: Joi.date()
});

module.exports.workspaceVersion = workspaceVersion;
