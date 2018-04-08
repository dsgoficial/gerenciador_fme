"use strict";

const fs = require("fs");
const exec = require("child_process").exec;

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

        let log_key;
        for (let key in parameters) {
          if (key.startsWith("log_")) {
            log_key = key;
          }
        }
        if (log_key) {
          try {
            let summary = getSummary(parameters[log_key]);
            resolve({ time: t1, summary });
          } catch (error) {
            reject("Erro na leitura do log.");
          }
        } else {
          resolve({ time: t1, summary: null });
        }
      } else {
        reject("Erro na execução da workspace.");
      }
    });
  });
};

module.exports.fmeRunner = fmeRunner;
