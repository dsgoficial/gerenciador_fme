'use strict'

const express = require('express')

const { asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const logCtrl = require('./log_ctrl')

const router = express.Router()

router.get(
  '/',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await logCtrl.getInfoLogs()

    const msg = 'Informação dos logs retornadas sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.delete(
  '/',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    await logCtrl.deleteLogs()

    const msg = 'Logs deletados com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

module.exports = router
