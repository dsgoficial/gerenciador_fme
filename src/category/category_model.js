"use strict";

const Joi = require("joi");

const category = Joi.object().keys({
  name: Joi.string().required()
});

module.exports.category = category;
