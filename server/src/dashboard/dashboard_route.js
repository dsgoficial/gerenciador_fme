'use strict'

const express = require('express')

const { asyncHandler, httpCode, schemaValidation } = require('../utils')

const dashboardCtrl = require('./dashboard_ctrl')
const dashboardSchema = require('./dashboard_schema')

const router = express.Router()

router.get(
  '/ultimas_execucoes',
  schemaValidation({
    query: dashboardSchema.totalQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await dashboardCtrl.getUltimasExecucoes(req.query.total)

    const msg = 'Ultimas execuções retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/execucoes/dia',
  schemaValidation({
    query: dashboardSchema.totalQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await dashboardCtrl.getExecucoesDia(req.query.total)

    const msg = 'Execuções por dia retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/execucoes/mes',
  schemaValidation({
    query: dashboardSchema.totalQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await dashboardCtrl.getExecucoesMes(req.query.total)

    const msg = 'Execuções por mês retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/execucoes/rotinas',
  schemaValidation({
    query: dashboardSchema.totalMaxQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await dashboardCtrl.getExecucoesRotinas(req.query.total, req.query.max)

    const msg = 'Execuções por rotinas retornadas com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/erros/rotinas',
  schemaValidation({
    query: dashboardSchema.totalMaxQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await dashboardCtrl.getErrorsRotinas(req.query.total, req.query.max)

    const msg = 'Erros por rotinas retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/tempo_execucao/rotinas',
  schemaValidation({
    query: dashboardSchema.totalMaxQuery
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await dashboardCtrl.getTempoExecucaoRotinas(req.query.total, req.query.max)

    const msg = 'Tempo de execução por rotinas retornados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/execucoes',
  asyncHandler(async (req, res, next) => {
    const dados = await dashboardCtrl.getExecucoes()

    const msg = 'Número de execuções retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.get(
  '/rotinas',
  asyncHandler(async (req, res, next) => {
    const dados = await dashboardCtrl.getRotinas()

    const msg = 'Número de rotinas retornado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

module.exports = router
