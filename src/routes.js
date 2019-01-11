"use strict";
const express = require("express");
const path = require("path");

const { loginRoute } = require("./login");

const { categoryRoute } = require("./category");
const { jobRoute } = require("./job");
const { workspacesRoute } = require("./workspace");
const { versionsRoute } = require("./version");
const { userRoute } = require("./user");

const routes = app => {
  app.use("/login", loginRoute);

  app.use("/client", express.static(path.join(__dirname, "http_client")));

  app.use(
    "/client/fme",
    express.static(path.join(__dirname, "fme_workspaces"))
  );

  app.use("/categories", categoryRoute);
  app.use("/users", userRoute);
  app.use("/jobs", jobRoute);
  app.use("/workspaces", workspacesRoute);
  app.use("/versions", versionsRoute);
};
module.exports = routes;
