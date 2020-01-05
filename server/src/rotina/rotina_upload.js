'use strict'

const multer = require('multer')
const { AppError, httpCode } = require('../utils')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './src/fme_workspaces/')
  },
  filename: (req, file, cb) => {
    const nome = file.originalname.split('.')
    const extensao = nome.pop()
    const ident = Date.now()
    const nomeCorrigido = nome.join('.') + '_' + ident + '.' + extensao
    cb(null, nomeCorrigido)
  }
})

const fileFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(fmw|FMW)$/)) {
    return cb(new AppError('O arquivo deve ter extensão .fmw', httpCode.BadRequest), false)
  }
  cb(null, true)
}

const upload = multer({ storage: storage, fileFilter: fileFilter }).single('rotina')

module.exports = upload
