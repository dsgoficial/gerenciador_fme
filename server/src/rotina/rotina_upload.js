'use strict'

const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './src/fme_workspaces/')
  },
  filename: (req, file, cb) => {
    const nome = file.originalname.split('.')
    const extensao = nome.pop()
    const ident = 1
    const nomeCorrigido = nome.join('.') + '_' + ident + '.' + extensao
    cb(null, nomeCorrigido)
  }
})

const upload = multer({ storage: storage }).single('workspace')

module.exports = upload
