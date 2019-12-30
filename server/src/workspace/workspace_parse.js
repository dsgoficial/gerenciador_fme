'use strict'

const path = require('path')
const fs = require('fs')

const getParams = workspacePath => {
  workspacePath = path.resolve(workspacePath)

  const parametros = []
  const data = fs.readFileSync(workspacePath, 'utf8')
  const linhas = data.split(/\r?\n/)
  linhas.slice(4).every(linha => {
    if (linha.indexOf('--') > -1) {
      parametros.push(
        linha
          .split(' ')
          .filter(i => i)[1]
          .replace('--', '')
      )
      return true
    } else {
      return false
    }
  })
  return parametros
}
module.exports.getParams = getParams
