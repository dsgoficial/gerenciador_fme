'use strict'
const express = require('express')
const path = require('path')

const { databaseVersion } = require('./database')
const {
  httpCode
} = require('./utils')

const { loginRoute } = require('./login')
const { categoriaRoute } = require('./categoria')
const { logRoute } = require('./log_files')
const { rotinaRoute } = require('./rotina')
const { usuarioRoute } = require('./usuario')
const { execucaoRoute } = require('./execucao')
const { dashboardRoute } = require('./dashboard')

const router = express.Router()

router.get('/', (req, res, next) => {
  return res.sendJsonAndLog(
    true,
    'Serviço do Gerenciador do FME operacional',
    httpCode.OK,
    {
      database_version: databaseVersion.nome
    }
  )
})

router.use('/login', loginRoute)

router.use(
  '/fme',
  express.static(path.join(__dirname, 'fme_workspaces'))
)

router.use('/categorias', categoriaRoute)

router.use('/logs', logRoute)

router.use('/rotinas', rotinaRoute)

router.use('/usuarios', usuarioRoute)

router.use('/execucoes', execucaoRoute)

router.use('/dashboard', dashboardRoute)

module.exports = router
