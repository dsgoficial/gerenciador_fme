'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyLogin } = require('../login')

const tarefaCtrl = require('./tarefa_ctrl')
const tarefaSchema = require('./tarefa_schema')

const router = express.Router()

router.get(
  '/cron',
  asyncHandler(async (req, res, next) => {
    const dados = await tarefaCtrl.getCron()

    const msg = 'Tarefas retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/cron',
  verifyLogin,
  schemaValidation({ body: tarefaSchema.tarefaCron }),
  asyncHandler(async (req, res, next) => {
    await tarefaCtrl.insertCron(req.usuarioUuid, req.body.nome, req.body.rotina_id, req.body.configuracao, req.body.parametros, req.body.data_inicio, req.body.data_fim)

    const msg = 'Tarefa criada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/cron/:uuid',
  verifyLogin,
  schemaValidation({
    params: tarefaSchema.uuidParams
  }),
  asyncHandler(async (req, res, next) => {
    await tarefaCtrl.deleteCron(req.params.uuid)

    const msg = 'Tarefa deletada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/data',
  asyncHandler(async (req, res, next) => {
    const dados = await tarefaCtrl.getData()

    const msg = 'Tarefas retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/data',
  verifyLogin,
  schemaValidation({ body: tarefaSchema.tarefaData }),
  asyncHandler(async (req, res, next) => {
    await tarefaCtrl.insertData(req.usuarioUuid, req.body.nome, req.body.rotina_id, req.body.configuracao, req.body.parametros)

    const msg = 'Tarefa criada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/data/:uuid',
  verifyLogin,
  schemaValidation({
    params: tarefaSchema.uuidParams
  }),
  asyncHandler(async (req, res, next) => {
    await tarefaCtrl.deleteData(req.params.uuid)

    const msg = 'Tarefa deletada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

module.exports = router
