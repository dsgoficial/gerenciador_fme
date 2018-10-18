"use strict";

const fs = require("fs");
const exec = require("child_process").exec;
const path = require("path");

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
  return summary;
};

const fmeRunner = (workspace_path, parameters) => {
  return new Promise((resolve, reject) => {
    let t0 = new Date();

    //build fme log name and path
    parameters["LOG_FILE"] =
      workspace_path
        .split(path.sep)
        .slice(0, -1)
        .join(path.sep) +
      path.sep +
      "fme_logs" +
      path.sep +
      workspace_path
        .split(path.sep)
        [workspace_path.split(path.sep).length - 1].replace(".fmw", "") +
      "_" +
      new Date()
        .toISOString()
        .replace(/-/g, "")
        .replace(/:/g, "")
        .split(".")[0] +
      ".log";

    let executeCmd = [process.env.FME_PATH, workspace_path];
    for (let key in parameters) {
      executeCmd.push(`--${key} "${parameters[key]}"`);
    }
    executeCmd = executeCmd.join(" ");

    exec(executeCmd, (err, stdout, stderr) => {
      if (err) {
        console.log(err)
        reject("Erro na execução da workspace.");
      } else if (stderr.trim() === "Translation was SUCCESSFUL") {
        let t1 = (new Date() - t0) / 1000;
        try {
          let summary = getSummary(parameters["LOG_FILE"]);
          resolve({ time: t1, summary });
        } catch (error) {
          console.log(error)
          reject("Erro na leitura do log.");
        }
      } else {
        reject("Erro na execução da workspace.");
      }
    });
  });
};

module.exports.fmeRunner = fmeRunner;
