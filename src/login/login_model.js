"use strict";

const Joi = require("joi");

const login = Joi.object().keys({
  user: Joi.string().required(),
  password: Joi.string().required()
});

module.exports.login = login;
