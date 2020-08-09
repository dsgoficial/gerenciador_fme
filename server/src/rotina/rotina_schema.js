"use strict";

const baseJoi = require("joi");

// https://github.com/hapijs/joi/issues/570
const Joi = baseJoi.extend((joi) => ({
  base: joi.array(),
  type: "stringArray",
  coerce: (value, state, options) => {
    if (typeof value !== "string") {
      return value;
    }

    return value.replace(/^,+|,+$/gm, "").split(",");
  },
}));

const models = {};

models.rotinaQuery = Joi.object().keys({
  categoria: Joi.number().integer(),
  ids: Joi.stringArray().items(Joi.number().integer()).unique().single(),
});

models.rotina = Joi.object().keys({
  nome: Joi.string().required(),
  descricao: Joi.string().required(),
  categoria_id: Joi.number().integer().required(),
  ativa: Joi.boolean().strict().required(),
});

models.versaoRotina = Joi.object().keys({
  nome: Joi.string().required(),
  descricao: Joi.string().required(),
  categoria_id: Joi.number().integer().required(),
});

models.rotinaParametros = Joi.object().keys({
  parametros: Joi.object(),
});

module.exports = models;
