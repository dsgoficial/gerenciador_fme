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

fmeRunner(
  "D:\\1_Desenvolvimento\\gerenciador_fme\\src\\fme_workspaces\\valida_edif_1516886669946.fmw",
  {
    db_SourceDataset_POSTGIS_2: "treinamento_conv_rs_1",
    utgeom_postgis_sql_where_clause:
      "st_intersects<openparen>geom<comma>st_geomfromewkt<openparen><apos>SRID=31982<semicolon>MULTIPOLYGON<openparen><openparen><openparen>262789.72853<space>7066743.2657<comma>262797.52998<space>7066840.98285<comma>262824.24727<space>7066935.29983<comma>262868.85345<space>7067022.59126<comma>262929.63393<space>7067099.50185<comma>263004.25245<space>7067163.07529<comma>263089.8408<space>7067210.86796<comma>263183.10915<space>7067241.04279<comma>263280.47245<space>7067252.43992<comma>267435.01793<space>7067328.6501<comma>271588.64849<space>7067403.49351<comma>275743.23369<space>7067477.0039<comma>275840.94276<space>7067469.12205<comma>275935.2362<space>7067442.3278<comma>276022.48968<space>7067397.65102<comma>276099.34947<space>7067336.80894<comma>276162.86132<space>7067262.14014<comma>276210.58404<space>7067176.51464<comma>276240.68333<space>7067083.2236<comma>276252.00227<space>7066985.85283<comma>276333.00616<space>7062368.68475<comma>276414.10876<space>7057752.61472<comma>276495.34944<space>7053135.40095<comma>276487.46158<space>7053037.71269<comma>276460.66932<space>7052943.43974<comma>276416.00205<space>7052856.20414<comma>276355.17591<space>7052779.35757<comma>276280.52791<space>7052715.85253<comma>276194.92608<space>7052668.12894<comma>276101.65931<space>7052638.02039<comma>276004.311<space>7052626.68366<comma>271854.48575<space>7052552.93641<comma>267705.69611<space>7052477.85331<comma>263555.74915<space>7052401.39457<comma>263458.05277<space>7052409.20178<comma>263363.75621<space>7052435.91682<comma>263276.48255<space>7052480.51325<comma>263199.58502<space>7052541.27759<comma>263136.01819<space>7052615.87513<comma>263088.22444<space>7052701.43967<comma>263058.0401<space>7052794.68366<comma>263046.62492<space>7052892.02444<comma>262960.86109<space>7057509.48976<comma>262875.24265<space>7062125.83162<comma>262789.72853<space>7066743.2657<closeparen><closeparen><closeparen><apos><closeparen><closeparen>",
    log_qualquerCoisa_text:
      "D:\\1_Desenvolvimento\\gerenciador_fme\\src\\fme_workspaces\\valida_edif.log"
  }
)
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.log(error);
  });

module.exports.fmeRunner = fmeRunner;
