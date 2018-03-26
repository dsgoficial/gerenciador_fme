"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const workspacesCtrl = require("./workspaces_ctrl");
const workspacesModel = require("./workspaces_model");
const uploadFile = require("./upload_file");

const router = express.Router();

router.get("/", (req, res, next) => {
  let { error, data } = await workspacesCtrl.get();
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Workspaces returned",
    "workspaces_route",
    null,
    res,
    200,
    data
  );
});

router.put("/:id", (req, res, next) => {
  let validationResult = Joi.validate(req.body, workspacesModel.workspace);
  if (validationResult.error) {
    const err = new Error("Update workspace validation error");
    err.status = 400;
    err.context = "workspaces_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  let { error } = await workspacesCtrl.update(
      req.params.id,
      req.body.name,
      req.body.description,
      req.body.category_id
  );
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


router.post("/:id/versions", (req, res, next) => {
  let validationResult = Joi.validate(req.body, workspacesModel.workspaceVersion);
  if (validationResult.error) {
    const err = new Error("Create workspace validation error");
    err.status = 400;
    err.context = "workspaces_route";
    err.information = {};
    err.information.id = req.params.id;
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  uploadFile(req, res, e => {
    if (e) {
      const err = new Error("Upload workspace file error");
      err.status = 400;
      err.context = "workspaces_route";
      err.information = {};
      err.information.id = req.params.id;
      err.information.body = req.body;
      err.information.trace = e;
      return next(err);
    }
    let { error } = await workspacesCtrl.saveWorkspace(
      req.file.path,
      req.body.version_name,
      req.body.version_date,
      req.body.version_author,
      null,
      null,
      null,
      req.params.id
    );
    if (error) {
      return next(error);
    }

    return sendJsonAndLog(
      true,
      "Workspace created",
      "workspaces_route",
      {
        id: req.params.id,
        body: req.body
      },
      res,
      201,
      null
    );
  });
});


router.post("/", (req, res, next) => {
  let validationResult = Joi.validate(req.body, workspacesModel.workspaceVersion);
  if (validationResult.error) {
    const err = new Error("Create workspace validation error");
    err.status = 400;
    err.context = "workspaces_route";
    err.information = {};
    err.information.body = req.body;
    err.information.trace = validationResult.error;
    return next(err);
  }

  uploadFile(req, res, e => {
    if (e) {
      const err = new Error("Upload workspace file error");
      err.status = 400;
      err.context = "workspaces_route";
      err.information = {};
      err.information.body = req.body;
      err.information.trace = e;
      return next(err);
    }
    let { error } = await workspacesCtrl.saveWorkspace(
      req.file.path,
      req.body.version_name,
      req.body.version_date,
      req.body.version_author,
      req.body.name,
      req.body.description,
      req.body.category_id
    );
    if (error) {
      return next(error);
    }

    return sendJsonAndLog(
      true,
      "Workspace created",
      "workspaces_route",
      {
        body: req.body
      },
      res,
      201,
      null
    );
  });
});

module.exports = router;
