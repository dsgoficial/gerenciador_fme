"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const loginMiddleware = require("./login_middleware");

const loginCtrl = require("./login_ctrl");
const loginModel = require("./login_model");

const router = express.Router();

/**
 * @api {post} /login Autenticação de um usuário
 * @apiGroup Login
 *
 * @apiParam (Request body) {String} login Usuário conforme acesso ao banco de dados de produção
 * @apiParam (Request body) {String} password Senha conforme acesso ao banco de dados de produção
 *
 * @apiSuccess {String} token JWT Token for authentication.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Authentication success",
 *       "token": "eyJhbGciOiJIUzI1NiIsIn..."
 *     }
 *
 * @apiError JsonValidationError O objeto json não segue o padrão estabelecido.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Login Post validation error"
 *     }
 *
 * @apiError AuthenticationError Usuário ou senha inválidas.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "message": "Falha durante autenticação"
 *     }
 */
router.post("/", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, loginModel.login);
  if (validationResult.error) {
    const err = new Error("Login Post validation error");
    err.status = 400;
    err.context = "login_route";
    err.information = { body: req.body, trace: validationResult.error };
    return next(err);
  }

  let { error, token } = await loginCtrl.login(
    req.body.login,
    req.body.password
  );
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Authentication success",
    "login_route",
    null,
    res,
    201,
    { token }
  );
});

router.post("/user", loginMiddleware, async (req, res, next) => {
  let validationResult = Joi.validate(req.body, loginModel.user, {stripUnknown: true});
  if (validationResult.error) {
    const err = new Error("New user validation error");
    err.status = 400;
    err.context = "login_route";
    err.information = { body: req.body, trace: validationResult.error };
    return next(err);
  }

  let { error } = await loginCtrl.createUser(
    req.body.name,
    req.body.login,
    req.body.password
  );
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "User created",
    "login_route",
    {
      body: req.body
    },
    res,
    201,
    null
  );
});

router.put("/user/:id", loginMiddleware, async (req, res, next) => {
  let validationResult = Joi.validate(req.body, loginModel.userWithoutPassword, {stripUnknown: true});
  if (validationResult.error) {
    const err = new Error("Update user validation error");
    err.status = 400;
    err.context = "login_route";
    err.information = {
      id: req.params.id,
      body: req.body,
      trace: validationResult.error
    };
    return next(err);
  }

  let { error } = await loginCtrl.updateUser(
    req.params.id,
    req.body.name,
    req.body.login
  );
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "User updated",
    "login_route",
    {
      id: req.params.id,
      body: req.body
    },
    res,
    200,
    null
  );
});

router.put("/user/:id/password", loginMiddleware, async (req, res, next) => {
  let validationResult = Joi.validate(req.body, loginModel.userPassword, {stripUnknown: true});
  if (validationResult.error) {
    const err = new Error("Update user password validation error");
    err.status = 400;
    err.context = "login_route";
    err.information = {
      id: req.params.id,
      trace: validationResult.error
    };
    return next(err);
  }

  let { error } = await loginCtrl.updatePassword(
    req.params.id,
    req.body.oldpassword,
    req.body.newpassword
  );
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "User password updated",
    "login_route",
    {
      id: req.params.id
    },
    res,
    200,
    null
  );
});

module.exports = router;
