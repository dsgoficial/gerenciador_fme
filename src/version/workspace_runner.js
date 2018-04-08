"use strict";

const fs = require("fs");
const exec = require("child_process").exec;

/*
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

module.exports = pythonRunner */

const getSummary = logPath => {
  logPath = logPath.trim();

  const contents = fs
    .readFileSync(logPath, "utf8")
    .toString()
    .split("\n");
  let fim = contents.length;
  let inicio = fim;
  let summary = [];
  contents.forEach(function(d, i) {
    let linha = d.split("|");
    linha = linha[linha.length - 1].trim();
    if (linha == "Features Written Summary") {
      inicio = i + 2;
    }
    if (i >= inicio && i < fim) {
      if (linha[0] == "=") {
        fim = i;
      } else {
        let e = linha.split(" ");
        summary.push(e[0] + ":" + e[e.length - 1]);
      }
    }
  });
  if (summary.length == 0) {
    summary.push("Sem feições gravadas");
  }
  console.log(summary);
  return summary;
};

const fmeRunner = (workspace_path, parameters) => {
  return new Promise((resolve, reject) => {
    let t0 = new Date();

    //build fme log name and path
    parameters["LOG_FILE"] =
      workspace_path
        .split("\\")
        .slice(0, -1)
        .join("\\") +
      "\\fme_logs\\" +
      workspace_path
        .split("\\")
        [workspace_path.split("\\").length - 1].replace(".fmw", "") +
      "_" +
      new Date()
        .toISOString()
        .replace(/-/g, "")
        .replace(/:/g, "")
        .split(".")[0] +
      ".log";

    let executeCmd = ["fme", workspace_path];
    for (let key in parameters) {
      executeCmd.push(`--${key} "${parameters[key]}"`);
    }
    executeCmd = executeCmd.join(" ");

    exec(executeCmd, (err, stdout, stderr) => {
      if (err) {
        reject("Erro na execução da workspace.");
      } else if (stderr.trim() === "Translation was SUCCESSFUL") {
        let t1 = (new Date() - t0) / 1000;
        try {
          let summary = getSummary(parameters["LOG_FILE"]);
          resolve({ time: t1, summary });
        } catch (error) {
          reject("Erro na leitura do log.");
        }
      } else {
        reject("Erro na execução da workspace.");
      }
    });
  });
};

module.exports.fmeRunner = fmeRunner;
