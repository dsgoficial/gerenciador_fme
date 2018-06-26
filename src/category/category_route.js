"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const { loginMiddleware } = require("../login");

const categoryCtrl = require("./category_ctrl");
const categoryModel = require("./category_model");

const router = express.Router();

/**
 * @api {get} /categories List all the categories
 * @apiVersion 1.0.0
 * @apiName GetAllCategories
 * @apiGroup Category
 * @apiPermission Logged User
 *
 * @apiDescription Used to return a list of categories
 *
 * @apiSuccess {Object[]} categories  List of categories.
 * @apiSuccess {Integer} categories.id  Id that identifies the category.
 * @apiSuccess {String} categories.name  Name of the category.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       "id": 1,
 *       "name": "Hidrography"
 *     },
 *     {
 *       "id": 5,
 *       "name": "Transportation"
 *     }]
 *
 */
router.get("/", loginMiddleware, async (req, res, next) => {
  let { error, data } = await categoryCtrl.get();
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Categories returned",
    "category_route",
    null,
    res,
    200,
    data
  );
});

/**
 * @api {post} /categorias Cria uma nova categoria
 * @apiVersion 1.0.0
 * @apiName CreateCategoria
 * @apiGroup Categoria
 * @apiPermission Manager
 *
 * @apiDescription Utilizado para criar uma nova categoria.
 *
 * @apiParam {String} nome  Novo nome para a categoria.
 * @apiParamExample {json} Input
 *     {
 *       "nome": "Transportes"
 *     }
 *
 * @apiSuccess {String} message  Mensagem de sucesso.
 *
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 201 OK
 *     {
 *       "message": "Categoria inserida com sucesso."
 *     }
 *
 * @apiError NoAccessRight Somente Gerentes autenticados podem criar categorias.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "NoAccessRight"
 *     }
 *
 * @apiError InvalidInput O objeto enviado como Input não segue o padrão estabelecido.
 *
 * @apiErrorExample InvalidInput:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "InvalidInput",
 *  	 "message": "O objeto enviado como Input não segue o padrão estabelecido."
 *     }
 */
router.post("/", loginMiddleware, async (req, res, next) => {
  let validationResult = Joi.validate(req.body, categoryModel.category, {stripUnknown: true});
  if (validationResult.error) {
    const err = new Error("Create category validation error");
    err.status = 400;
    err.context = "category_route";
    err.information = { body: req.body, trace: validationResult.error };
    return next(err);
  }

  let { error } = await categoryCtrl.create(req.body.name);
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Category created",
    "category_route",
    {
      body: req.body
    },
    res,
    201,
    null
  );
});

/**
 * @api {put} /categorias/:id Atualiza uma categoria
 * @apiVersion 1.0.0
 * @apiName UpdateCategoria
 * @apiGroup Categoria
 * @apiPermission Manager
 *
 * @apiDescription Utilizado para atualizar informações de uma categoria.
 *
 * @apiParam {Number} id  Id que identifica a categoria.
 *
 * @apiParam {String} nome  Novo nome para a categoria.
 * @apiParamExample {json} Input
 *     {
 *       "nome": "Vegetação"
 *     }
 *
 *
 * @apiSuccess {String} message  Mensagem de sucesso.
 *
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 201 OK
 *     {
 *       "message": "Categoria atualizada com sucesso."
 *     }
 *
 * @apiError NoAccessRight Somente Gerentes autenticados podem atualizar categorias.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "NoAccessRight"
 *     }
 *
 * @apiError CategoriaNotFound O Id da categoria não foi encontrado.
 *
 * @apiErrorExample CategoriaNotFound:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "CategoriaNotFound"
 *     }
 *
 * @apiError InvalidInput O objeto enviado como Input não segue o padrão estabelecido.
 *
 * @apiErrorExample InvalidInput:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "InvalidInput",
 *  	 "message": "O objeto enviado como Input não segue o padrão estabelecido."
 * }
 */
router.put("/:id", loginMiddleware, async (req, res, next) => {
  let validationResult = Joi.validate(req.body, categoryModel.category, {stripUnknown: true});
  if (validationResult.error) {
    const err = new Error("Update category validation error");
    err.status = 400;
    err.context = "category_route";
    err.information = {
      id: req.params.id,
      body: req.body,
      trace: validationResult.error
    };
    return next(err);
  }

  let { error } = await categoryCtrl.update(req.params.id, req.body.name);
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Category updated",
    "category_route",
    {
      id: req.params.id,
      body: req.body
    },
    res,
    200,
    null
  );
});

module.exports = router;
