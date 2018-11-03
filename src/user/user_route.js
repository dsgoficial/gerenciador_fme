"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const { loginMiddleware } = require("../login");

const userCtrl = require("./user_ctrl");

const router = express.Router();

/**
 * @api {get} /categories List all the users
 * @apiVersion 1.0.0
 * @apiName GetAllUsers
 * @apiGroup User
 * @apiPermission Manager
 *
 * @apiDescription Used to return a list of users
 *
 * @apiSuccess {Object[]} users  List of users.
 * @apiSuccess {Integer} users.id  Id that identifies the user.
 * @apiSuccess {String} users.name  Name of the user.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success": true,
 *      "message": "Categories returned",
 *      "data":
 *        [{
 *          "id": 1,
 *          "name": "Administrador"
 *         },
 *         {
 *          "id": 2,
 *          "name": "Diniz"
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
  let { error, data } = await userCtrl.get();
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Users returned",
    "user_route",
    null,
    res,
    200,
    data
  );
});

module.exports = router;
