'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyLogin } = require('../login')

const tarefaCtrl = require('./tarefa_ctrl')
const tarefaSchema = require('./tarefa_schema')

const router = express.Router()

router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const dados = await tarefaCtrl.get()

    const msg = 'Tarefas retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/',
  verifyLogin,
  schemaValidation({ body: tarefaSchema.tarefa }),
  asyncHandler(async (req, res, next) => {
    await tarefaCtrl.insert(req.usuarioUuid, req.body.rotina_id, req.body.configuracao, req.body.parametros, req.body.tipo)

    const msg = 'Tarefa criada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.delete(
  '/:uuid',
  verifyLogin,
  schemaValidation({
    params: tarefaSchema.uuidParams
  }),
  asyncHandler(async (req, res, next) => {
    await tarefaCtrl.delete(req.params.id)

    const msg = 'Tarefa deletada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

module.exports = router
