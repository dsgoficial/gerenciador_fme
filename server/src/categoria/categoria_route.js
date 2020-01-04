'use strict'

const express = require('express')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyLogin } = require('../login')

const categoriaCtrl = require('./categoria_ctrl')
const categoriaSchema = require('./categoria_schema')

const router = express.Router()

router.get(
  '/',
  asyncHandler(async (req, res, next) => {
    const dados = await categoriaCtrl.get()

    const msg = 'Categorias retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/',
  verifyLogin,
  schemaValidation({ body: categoriaSchema.categoria }),
  asyncHandler(async (req, res, next) => {
    await categoriaCtrl.insert(req.body.nome, req.body.descricao)

    const msg = 'Categoria criada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.put(
  '/:id',
  verifyLogin,
  schemaValidation({
    body: categoriaSchema.categoria,
    params: categoriaSchema.idParams
  }),
  asyncHandler(async (req, res, next) => {
    await categoriaCtrl.update(req.params.id, req.body.nome, req.body.descricao)

    const msg = 'Categoria atualizada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.delete(
  '/:id',
  verifyLogin,
  schemaValidation({
    params: categoriaSchema.idParams
  }),
  asyncHandler(async (req, res, next) => {
    await categoriaCtrl.delete(req.params.id)

    const msg = 'Categoria deletada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

module.exports = router
