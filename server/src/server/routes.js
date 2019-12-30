'use strict'

const { loginRoute } = require('../login')
const { categoriaRoute } = require('../categoria')
const { workspaceRoute } = require('../workspace')
const { usuarioRoute } = require('../usuario')
const { jobRoute } = require('../job')

const routes = app => {
  app.use('/login', loginRoute)

  // app.use("/client", express.static(path.join(__dirname, "http_client")));

  // app.use(
  //   "/client/fme",
  //   express.static(path.join(__dirname, "fme_workspaces"))
  // );

  app.use('/categorias', categoriaRoute)

  app.use('/workspaces', workspaceRoute)

  app.use('/usuarios', usuarioRoute)

  app.use('/jobs', jobRoute)
}
module.exports = routes
