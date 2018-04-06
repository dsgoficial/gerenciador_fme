const Joi = require("joi");

const version = Joi.object().keys({
  nome: Joi.string()
    .alphanum()
    .min(1)
    .max(255)
    .required(),
  author: Joi.string()
    .alphanum()
    .min(1)
    .max(255)
    .required(),
  version_date: Joi.date(),
  acessible: Joi.boolean()
});

module.exports.version = version;

const job = Joi.object().keys({
  parameters: Joi.object().min(1)
});

module.exports.job = job;
