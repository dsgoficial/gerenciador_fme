"use strict";

const Joi = require("joi");

const user = Joi.object().keys({
  name: Joi.string().required()
});

module.exports.user = user;
