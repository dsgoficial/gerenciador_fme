'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')
const childProcess = require('child_process')

const readFile = util.promisify(fs.readFile)
const exec = util.promisify(childProcess.exec)

const { AppError } = require('../utils')

const { FME_PATH, PATH_WORKSPACES } = require('../config')

const getSummary = async logPath => {
  const dados = await readFile(logPath.trim(), 'utf8')

  const contents = dados.toString().split('\n')

  let fim = contents.length
  let inicio = fim
  const summary = []

  contents.forEach((d, i) => {
    let linha = d.split('|')
    linha = linha[linha.length - 1].trim()
    if (linha === 'Features Written Summary') {
      inicio = i + 2
    }
    if (i >= inicio && i < fim) {
      if (linha[0] === '=') {
        fim = i
      } else {
        const e = linha.split(' ')
        summary.push({ classes: e[0], feicoes: e[e.length - 1] })
      }
    }
  })
  return summary
}

const fmeRunner = async (workspacePath, parameters) => {
  workspacePath = path.join(PATH_WORKSPACES, workspacePath)

  const mainPath = workspacePath
    .split(path.sep)
    .slice(0, -1)
    .join(path.sep)

  const logDate = new Date()
    .toISOString()
    .replace(/-/g, '')
    .replace(/:/g, '')
    .split('.')[0]

  const fixedWorkspacePath = workspacePath
    .split(path.sep)[workspacePath.split(path.sep).length - 1]
    .replace('.fmw', '')

  parameters.LOG_FILE = `${mainPath}${path.sep}fme_logs${path.sep}${fixedWorkspacePath}_${logDate}.log`

  const executeCmdArray = [FME_PATH, workspacePath]
  for (const key in parameters) {
    executeCmdArray.push(`--${key} "${parameters[key]}"`)
  }
  const executeCmd = executeCmdArray.join(' ')

  try {
    const { stderr } = await exec(executeCmd, { maxBuffer: Infinity })
    if (stderr.trim().indexOf('Translation was SUCCESSFUL') === -1) {
      throw new Error()
    }

    return getSummary(parameters.LOG_FILE)
  } catch (e) {
    throw new AppError('Erro na execução da workspace.', null, e)
  }
}

module.exports = fmeRunner
