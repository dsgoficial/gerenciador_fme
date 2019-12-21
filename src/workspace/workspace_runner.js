'use strict'

const fs = require('fs')
const exec = require('child_process').exec
const path = require('path')
const { AppError } = require('../utils')

const getSummary = logPath => {
  logPath = logPath.trim()

  const contents = fs
    .readFileSync(logPath, 'utf8')
    .toString()
    .split('\n')
  let fim = contents.length
  let inicio = fim
  const summary = []
  contents.forEach(function (d, i) {
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
        summary.push(e[0] + ':' + e[e.length - 1])
      }
    }
  })
  if (summary.length === 0) {
    summary.push('Sem feições gravadas')
  }
  return summary
}

const fmeRunner = (workspacePath, parameters) => {
  return new Promise((resolve, reject) => {
    const t0 = new Date()

    // build fme log name and path
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

    let executeCmd = [process.env.FME_PATH, workspacePath]
    for (const key in parameters) {
      executeCmd.push(`--${key} "${parameters[key]}"`)
    }
    executeCmd = executeCmd.join(' ')

    exec(executeCmd, { maxBuffer: Infinity }, (err, stdout, stderr) => {
      if (err) {
        console.log(err)
        reject(new AppError('Erro na execução da workspace.'))
      } else if (stderr.trim().indexOf('Translation was SUCCESSFUL') !== -1) {
        const t1 = (new Date() - t0) / 1000
        try {
          const summary = getSummary(parameters.LOG_FILE)
          resolve({ time: t1, summary })
        } catch (error) {
          console.log(error)
          reject(new AppError('Erro na leitura do log.'))
        }
      } else {
        console.log(stderr)
        reject(new AppError('Erro na execução da workspace.'))
      }
    })
  })
}

module.exports.fmeRunner = fmeRunner
