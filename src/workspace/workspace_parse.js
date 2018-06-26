"use strict";

const path = require("path");
const fs = require("fs");

const getParams = workspace_path => {
  workspace_path = path.resolve(workspace_path);

  const parametros = [];
  const data = fs.readFileSync(workspace_path, "utf8");
  let linhas = data.split(/\r?\n/);
  linhas.slice(4).every(linha => {
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
  return parametros;
};
module.exports.getParams = getParams;
