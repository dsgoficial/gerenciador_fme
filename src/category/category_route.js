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
 * @apiPermission Manager
 *
 * @apiDescription Used to return a list of categories
 *
 * @apiSuccess {Object[]} categories  List of categories.
 * @apiSuccess {Integer} categories.id  Id that identifies the category.
 * @apiSuccess {String} categories.name  Name of the category.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success": true,
 *      "message": "Categories returned",
 *      "data":
 *        [{
 *          "id": 1,
 *          "name": "Hidrography"
 *         },
 *         {
 *          "id": 5,
 *          "name": "Transportation"
 *        }]
 *
 * @apiError NoAccessRight Invalid token.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "success": false,
 *       "message": "Failed to authenticate token"
 *     }
 *
 * @apiError NoAccessRight No token provided.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "success": false,
 *       "message": "No token provided"
 *     }
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
 * @api {post} /categories Create a new category
 * @apiVersion 1.0.0
 * @apiName CreateCategory
 * @apiGroup Category
 * @apiPermission Manager
 *
 * @apiDescription Used to create a new category.
 *
 * @apiParam {String} name Name for the new category. Must be unique.
 * @apiParamExample {json} Input
 *     {
 *       "name": "Transportation"
 *     }
 *
 * @apiSuccess {String} message Success-Response.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "success": true,
 *       "message": "Category created"
 *     }
 *
 * @apiError ValidationError Invalid param.
 *
 * @apiErrorExample ValidationError:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Create category validation error"
 *     }
 *
 * @apiError NoAccessRight Invalid token.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "success": false,
 *       "message": "Failed to authenticate token"
 *     }
 *
 * @apiError NoAccessRight No token provided.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "success": false,
 *       "message": "No token provided"
 *     }
 */
router.post("/", loginMiddleware, async (req, res, next) => {
  let validationResult = Joi.validate(req.body, categoryModel.category, {
    stripUnknown: true
  });
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
 * @api {put} /categories/:id Update a category
 * @apiVersion 1.0.0
 * @apiName UpdateCategory
 * @apiGroup Category
 * @apiPermission Manager
 *
 * @apiDescription Updates a category.
 *
 * @apiParam {Number} id  Id that identifies the category.
 *
 * @apiParam {String} name  New name for the category.
 * @apiParamExample {json} Input
 *     {
 *       "name": "Vegetation"
 *     }
 *
 * @apiSuccess {String} message Success-Response.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 OK
 *     {
 *       "success": true,
 *       "message": "Category updated"
 *     }
 *
 * @apiError ValidationError Invalid param.
 *
 * @apiErrorExample ValidationError:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Update category validation error"
 *     }
 *
 *
 * @apiError NoAccessRight Invalid token.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "success": false,
 *       "message": "Failed to authenticate token"
 *     }
 *
 * @apiError NoAccessRight No token provided.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "success": false,
 *       "message": "No token provided"
 *     }
 */
router.put("/:id", loginMiddleware, async (req, res, next) => {
  let validationResult = Joi.validate(req.body, categoryModel.category, {
    stripUnknown: true
  });
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
