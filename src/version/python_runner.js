const fs = require('fs')
const PythonShell = require('python-shell')
const settings = require('../config.json')

const pythonRunner = {}

//da parse no arquivo log para extrair o sumario de execução
const getSummary = logPath => {
  return new Promise((resolve, reject) => {
    logPath = logPath.trim()

    fs.readFile(logPath, 'utf-8', (err, content) => {
      if (err) {
        reject(err)
      }
      let array = content.toString().split("\n")
      let inicio
      let fim = array.length
      let summary = []

      array.forEach(function(d,i){
        let linha = d.split('|')
        linha = linha[linha.length - 1].trim()
        if(linha == 'Features Written Summary'){
          inicio = i+2
        }
        if(i >= inicio && i < fim){
          if(linha[0] == '='){
            fim = i
          } else {
            var e = linha.split(' ')
            summary.push(e[0] + ":" + e[e.length-1])
          }
        }
      })
      if(summary.length > 0){
        resolve(summary.join(' | '))
      } else {
        resolve('Sem feições gravadas') 
      }
    })
  })
}

/* Esta função recebe como entrada a localização da tabela do FME no servidor
  e executa o script python fme_params utilizando PythonShell.
  O script fme_params retorna um JSON contendo informações sobre os parametros desc
  entrada e saída da tabela do FME.
*/
pythonRunner.getParams = caminhoWorkspace => {
  const options = {
    mode: 'json',
    pythonPath: settings.python,
    args: [settings.pythonFME, caminhoWorkspace]
  }
  return new Promise(function(resolve, reject) {
    PythonShell.run('./src/python/fme_params.py', options, (err, results) => {
    if (err){
      reject('Erro na execução do script python fme_params.')
    }
    if(results && results.length > 0){
      resolve(results[0])
    } else {
      reject('Erro na execução do script python fme_params.')
    } 
    })
  })
}

//executa uma workspace do FME dado o caminho para ela e seus parametros
pythonRunner.runWorkspace = (caminhoWorkspace, parametros) => {
  const options = {
    mode: 'text',
    pythonPath: settings.python,
    args: [settings.pythonFME, caminhoWorkspace,JSON.stringify(parametros)]
  }
  return new Promise((resolve, reject) => {
    let t0 = new Date()
    let t1
    PythonShell.run('./src/python/fme_runner.py', options, async (err, result) => {
      if (err){
        reject('Erro na execução do script python fme_runner.')
      } else {
        t1 = (new Date() - t0)/1000
        if(result && result.length > 0 && result[0].search('Failure') == -1){
          let logfile = result[0]
          let summary
          try {
            summary = await getSummary(logfile)
            resolve({tempo: t1, summary})
          } catch (error){
            reject('Erro na leitura do log.')
          }
        } else {
          reject('Erro de execução na tabela do FME.')
        }
      }
    })
  })
}

module.exports = pythonRunner