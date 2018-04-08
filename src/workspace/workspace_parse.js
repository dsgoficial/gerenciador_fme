"use strict";

const path = require("path");
const fs = require("fs");

const getParams = async workspace_path => {
  const parametros = [];
  await fs.readFile(workspace_path, "utf8", (err, data) => {
    if (err) {
      return { error: err, data: null };
    }
    let linhas = data.split(/\r?\n/);
    linhas.slice(8).every(linha => {
      if (linha.indexOf("--") > -1) {
        parametros.push(
          linha
            .split(" ")
            .filter(i => i)[1]
            .replace("--", "")
        );
        return true;
      } else {
        return false;
      }
    });
  });
  return parametros;
};
module.exports.getParams = getParams;
