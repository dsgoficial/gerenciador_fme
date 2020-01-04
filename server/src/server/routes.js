'use strict'

const express = require('express')
const path = require('path')

const { loginRoute } = require('../login')
const { categoriaRoute } = require('../categoria')
const { logRoute } = require('../log_files')
const { rotinaRoute } = require('../rotina')
const { usuarioRoute } = require('../usuario')
const { execucaoRoute } = require('../execucao')
const { dashboardRoute } = require('../dashboard')

const routes = app => {
  app.use('/login', loginRoute)

  app.use(
    '/fme',
    express.static(path.join(__dirname, 'fme_workspaces'))
  )

  app.use('/categorias', categoriaRoute)

  app.use('/logs', logRoute)

  app.use('/rotinas', rotinaRoute)

  app.use('/usuarios', usuarioRoute)

  app.use('/execucoes', execucaoRoute)

  app.use('/dashboard', dashboardRoute)
}
module.exports = routes
