'use strict'

const express = require('express')

const { asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const usuarioCtrl = require('./usuario_ctrl')

const router = express.Router()

router.get(
  '/',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await usuarioCtrl.get()

    const msg = 'Usuários retornados'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

module.exports = router
