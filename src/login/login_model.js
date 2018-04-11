"use strict";

const Joi = require("joi");

const login = Joi.object().keys({
  login: Joi.string().required(),
  password: Joi.string().required()
});

module.exports.login = login;

const user = Joi.object().keys({
  name: Joi.string().required(),
  login: Joi.string().required(),
  password: Joi.string().required()
});

module.exports.user = user;

const userWithoutPassword = Joi.object().keys({
  name: Joi.string().required(),
  login: Joi.string().required()
});

module.exports.userWithoutPassword = userWithoutPassword;

const userPassword = Joi.object().keys({
  oldpassword: Joi.string().required(),
  newpassword: Joi.string().required()
});

module.exports.userPassword = userPassword;

