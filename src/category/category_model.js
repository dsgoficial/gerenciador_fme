"use strict";

const Joi = require("joi");

const category = Joi.object().keys({
  name: Joi.string()
    .alphanum()
    .min(1)
    .max(255)
    .required()
});

module.exports.category = category;
