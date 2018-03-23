"use strict";

const { loginRoute, loginMiddleware } = require("./login");

const { categoryRoute } = require("./category_route");
const { jobRoute } = require("./job_route");
const { workspaceRoute } = require("./workspace_route");
const { versionRoute } = require("./version_route");

const routes = app => {
  app.use("/login", loginRoute);

  //Serve HTTP Client
  app.use("/client", express.static(path.join(__dirname, "http_client")));

  //Todas as requisições abaixo necessitam Token
  app.use(loginMiddleware);

  //Serve static files (baixar tabelas do FME carregadas)
  app.use("/fme", express.static(path.join(__dirname, "fme_workspaces")));

  app.use("/categories", categoryRoute);
  app.use("/jobs", jobRoute);
  app.use("/workspaces", workspaceRoute);
  app.use("/versions", versionRoute);
};
module.exports = routes;
