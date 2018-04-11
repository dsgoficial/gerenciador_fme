const Joi = require("joi");

const version = Joi.object().keys({
  name: Joi.string().required(),
  author: Joi.number().integer().required(),
  version_date: Joi.date(),
  accessible: Joi.boolean()
});

module.exports.version = version;

const job = Joi.object().keys({
  parameters: Joi.object().min(1)
});

module.exports.job = job;
