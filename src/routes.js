"use strict";

const { loginRoute, loginMiddleware } = require("./login");

const { categoryRoute } = require("./category");
const { jobRoute } = require("./job");
const { workspaceRoute } = require("./workspace");
const { versionRoute } = require("./version");

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
