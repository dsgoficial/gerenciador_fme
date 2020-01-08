'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')

const readdir = util.promisify(fs.readdir)
const stat = util.promisify(fs.stat)
const unlink = util.promisify(fs.unlink)

const pathToFiles = './src/fme_workspaces/fme_logs'

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const controller = {}

controller.deleteLogs = async () => {
  const files = await readdir(pathToFiles)
  return Promise.all(files.map(f => unlink(path.join(pathToFiles, f))))
}

controller.getInfoLogs = async () => {
  const files = await readdir(pathToFiles)
  const filesFiltered = files.filter(f => f.endsWith('.log'))
  const stats = await Promise.all(filesFiltered.map(f => stat(path.join(pathToFiles, f))))

  let size = 0
  stats.forEach(s => {
    size += s.size
  })
  return { tamanho: formatBytes(size), arquivos: filesFiltered.length }
}

module.exports = controller
