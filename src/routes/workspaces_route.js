const express = require('express')

const workspacesCtrl = require('../controllers/workspaces_ctrl')
const upload = require('../utils/upload_file')
const validator = require('../utils/model_validation')

const router = express.Router()

//retorna todas as workspaces
router.get('/', (req, res, next) => {
  workspacesCtrl.get(req, res, next)
})

//Update nas informações de uma workspace
router.put('/:id', validator.workspaces, (req, res, next) => {
  workspacesCtrl.put(req, res, next, req.body, req.params.id)
})

//Inserir uma nova versão de uma workspace no servidor
router.post('/:id/versions', validator.versions, (req, res, next) => {
  upload(req, res, err => {
    if (err) {
      // An error occurred when uploading
      next(err)
    }
    workspacesCtrl.saveVersion(req, res, next, req.body, req.file.path, req.params.id)
  })
  
})

//Inserir uma nova workspace no servidor
router.post('/', validator.workspaces, (req, res, next) => {
  upload(req, res, err => {
    if (err) {
      // An error occurred when uploading
      return next(err)
    }
    workspacesCtrl.saveWorkspace(req, res, next, req.body, req.file.path)
  })
})

module.exports = router