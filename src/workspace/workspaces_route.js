"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const { loginMiddleware } = require("../login");

const workspacesCtrl = require("./workspaces_ctrl");
const { workspaceVersion, workspace, version } = require("./workspaces_model");
const uploadWorkspace = require("./upload_workspace");

const router = express.Router();

router.get("/", loginMiddleware, async (req, res, next) => {
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

router.put("/:id", loginMiddleware, async (req, res, next) => {
  let validationResult = Joi.validate(req.body, workspace, {
    stripUnknown: true
  });
  if (validationResult.error) {
    const err = new Error("Update workspace validation error");
    err.status = 400;
    err.context = "workspaces_route";
    err.information = { body: req.body, trace: validationResult.error };
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

router.post("/:id/versions", loginMiddleware, async (req, res, next) => {
  uploadWorkspace(req, res, async e => {
    if (e || !req.file) {
      const err = new Error("Upload workspace file error");
      err.status = 400;
      err.context = "workspaces_route";
      err.information = {
        trace: e
      };
      return next(err);
    }

    let validationResult = Joi.validate(req.body, version, {
      stripUnknown: true
    });
    if (validationResult.error) {
      const err = new Error("Create workspace validation error");
      err.status = 400;
      err.context = "workspaces_route";
      err.information = {
        id: req.params.id,
        body: req.body,
        trace: validationResult.error
      };
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

router.post("/", loginMiddleware, async (req, res, next) => {
  uploadWorkspace(req, res, async e => {
    if (e || !req.file) {
      const err = new Error("Upload workspace file error");
      err.status = 400;
      err.context = "workspaces_route";
      err.information = { trace: e };
      return next(err);
    }

    let validationResult = Joi.validate(req.body, workspaceVersion, {
      stripUnknown: true
    });
    if (validationResult.error) {
      const err = new Error("Create workspace validation error");
      err.status = 400;
      err.context = "workspaces_route";
      err.information = { body: req.body, trace: validationResult.error };
      return next(err);
    }
    let { error } = await workspacesCtrl.saveWorkspace(
      req.file.path,
      req.body.version_name,
      req.body.version_date,
      req.body.version_author_id,
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
