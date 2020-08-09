const schedule = require("node-schedule");
const { v4: uuidv4 } = require("uuid");

const { db } = require("../database");
const jobQueue = require("../queue");

const { logger } = require("../utils");

const handleTarefas = {};

handleTarefas.tarefasAgendadas = {};

const criaExecucao = async (uuid, versao, rotina, parametros) => {
  await db.conn.none(
    `
      INSERT INTO fme.execucao(uuid, status_id, versao_rotina_id, rotina_id, data_execucao, parametros)
      VALUES($<uuid>,1,$<versao>,$<rotina>, CURRENT_TIMESTAMP, $<parametros:json>)
      `,
    { uuid, versao, rotina, parametros }
  );
};

const loadTarefaData = (tarefas) => {
  tarefas.forEach((t) => {
    const job = schedule.scheduleJob(t.configuracao, async () => {
      const jobUuid = uuidv4();
      const taskId = `${jobUuid}|${t.uuid}`;
      await criaExecucao(jobUuid, t.versao, t.rotina, t.parametros);
      logger.info("Inicio execução tarefa data", {
        uuid: t.uuid,
      });
      jobQueue.push({
        id: taskId,
        rotinaPath: t.path,
        parametros: t.parametros,
      });
    });
    handleTarefas.tarefasAgendadas[t.uuid] = job;
  });
};

const loadTarefaCron = (tarefas) => {
  tarefas.forEach((t) => {
    const job = schedule.scheduleJob(
      { start: t.data_inicio, end: t.data_fim, rule: t.configuracao },
      async () => {
        const jobUuid = uuidv4();
        const taskId = `${jobUuid}|${t.uuid}`;
        await criaExecucao(jobUuid, t.versao, t.rotina, t.parametros);
        logger.info("Inicio execução tarefa cron", {
          uuid: t.uuid,
        });
        jobQueue.push({
          id: taskId,
          rotinaPath: t.path,
          parametros: t.parametros,
        });
      }
    );
    handleTarefas.tarefasAgendadas[t.uuid] = job;
  });
};

handleTarefas.cancel = (uuid) => {
  handleTarefas.tarefasAgendadas[uuid].cancel();
};

handleTarefas.loadData = (
  uuid,
  path,
  configuracao,
  parametros,
  versao,
  rotina
) => {
  loadTarefaData([{ uuid, path, configuracao, parametros, versao, rotina }]);
};

handleTarefas.loadCron = (
  uuid,
  path,
  configuracao,
  parametros,
  dataInicio,
  dataFim,
  versao,
  rotina
) => {
  loadTarefaCron([
    {
      uuid,
      path,
      configuracao,
      parametros,
      data_inicio: dataInicio,
      data_fim: dataFim,
      versao,
      rotina,
    },
  ]);
};

handleTarefas.carregaTarefasAgendadas = async () => {
  const tarefasData = await db.conn.any(
    `
    SELECT ta.uuid, ta.data_execucao AS configuracao, ta.parametros, vr.path, vr.id AS versao, vr.rotina_id AS rotina
    FROM fme.tarefa_agendada_data AS ta
    INNER JOIN (SELECT *, ROW_NUMBER() OVER (PARTITION BY rotina_id ORDER BY data DESC) rn FROM fme.versao_rotina) AS vr
    ON vr.rotina_id = ta.rotina_id
    WHERE vr.rn = 1 AND ta.data_execucao > now()
    `
  );
  if (tarefasData.length > 0) {
    loadTarefaData(tarefasData);
  }

  const tarefasCron = await db.conn.any(
    `
    SELECT ta.uuid, ta.configuracao_cron AS configuracao, ta.parametros, vr.path, vr.id AS versao, vr.rotina_id AS rotina,
    ta.data_inicio, ta.data_fim
    FROM fme.tarefa_agendada_cron AS ta
    INNER JOIN (SELECT *, ROW_NUMBER() OVER (PARTITION BY rotina_id ORDER BY data DESC) rn FROM fme.versao_rotina) AS vr
    ON vr.rotina_id = ta.rotina_id
    WHERE vr.rn = 1 AND (ta.data_fim IS NULL OR ta.data_fim::timestamp with time zone > now())
    `
  );
  if (tarefasCron.length > 0) {
    loadTarefaCron(tarefasCron);
  }
};

module.exports = handleTarefas;
