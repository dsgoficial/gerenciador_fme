'use strict'

const express = require('express')

const uuid = require('uuid')

const { schemaValidation, asyncHandler, httpCode } = require('../utils')

const { verifyAdmin } = require('../login')

const workspacesCtrl = require('./workspaces_ctrl')
const workspaceSchema = require('./workspaces_schema')
const uploadWorkspace = require('./upload_workspace')

const router = express.Router()

router.post(
  '/:id/version',
  verifyAdmin,
  uploadWorkspace,
  schemaValidation({
    params: workspaceSchema.idParams,
    body: workspaceSchema.version
  }),
  asyncHandler(async (req, res, next) => {
    await workspacesCtrl.saveWorkspace(
      req.file.path,
      req.body.version_name,
      req.body.version_date,
      req.body.version_author,
      null,
      null,
      null,
      req.params.id
    )

    const msg = 'Nova versão da workspace criada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

router.post(
  '/:id/jobs',
  verifyAdmin,
  uploadWorkspace,
  schemaValidation({
    params: workspaceSchema.idParams,
    body: workspaceSchema.jobParameters
  }),
  asyncHandler(async (req, res, next) => {
    const jobUuid = uuid()

    await workspacesCtrl.executeWorkspace(
      req.params.id,
      jobUuid,
      req.body.parameters
    )

    const msg = 'Job de execução da workspace criado com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created, { jobUuid })
  })
)

router.put(
  '/version/:id',
  verifyAdmin,
  schemaValidation({
    params: workspaceSchema.idParams,
    body: workspaceSchema.version
  }),
  asyncHandler(async (req, res, next) => {
    await workspacesCtrl.updateVersion(
      req.params.id,
      req.body.name,
      req.body.author,
      req.body.version_date,
      req.body.accessible
    )

    const msg = 'Versão da workspace atualizada'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/version',
  asyncHandler(async (req, res, next) => {
    const dados = await workspacesCtrl.getVersions(
      req.query.last === 'true',
      req.query.category,
      req.query.workspace
    )

    const msg = 'Versões retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.put(
  '/:id',
  verifyAdmin,
  schemaValidation({
    params: workspaceSchema.idParams,
    body: workspaceSchema.workspace
  }),
  asyncHandler(async (req, res, next) => {
    await workspacesCtrl.update(
      req.params.id,
      req.body.name,
      req.body.description,
      req.body.category_id
    )

    const msg = 'Versão da workspace atualizada'

    return res.sendJsonAndLog(true, msg, httpCode.OK)
  })
)

router.get(
  '/',
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await workspacesCtrl.get()

    const msg = 'Workspaces retornadas'

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados)
  })
)

router.post(
  '/',
  verifyAdmin,
  uploadWorkspace,
  schemaValidation({
    body: workspaceSchema.workspaceVersion
  }),
  asyncHandler(async (req, res, next) => {
    await workspacesCtrl.saveWorkspace(
      req.file.path,
      req.body.version_name,
      req.body.version_date,
      req.body.version_author_id,
      req.body.name,
      req.body.description,
      req.body.category_id
    )

    const msg = 'Workspace criada com sucesso'

    return res.sendJsonAndLog(true, msg, httpCode.Created)
  })
)

module.exports = router
