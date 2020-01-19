
const schedule = require('node-schedule')
const uuidv4 = require('uuid/v4')

const { db } = require('../database')
const jobQueue = require('../queue')

const handleTarefas = {}

handleTarefas.tarefasAgendadas = {}

const loadTarefaData = tarefas => {
  tarefas.forEach(t => {
    const job = schedule.scheduleJob(t.configuracao, () => {
      const jobUuid = uuidv4()
      const taskId = `${jobUuid}|${t.uuid}`
      jobQueue.push({ id: taskId, rotinaPath: t.path, parameteros: t.parametros })
    })
    handleTarefas.tarefasAgendadas[t.uuid] = job
  })
}

const loadTarefaCron = tarefas => {
  tarefas.forEach(t => {
    const job = schedule.scheduleJob({ start: t.data_inicio, end: t.data_fim, rule: t.configuracao }, () => {
      const jobUuid = uuidv4()
      const taskId = `${jobUuid}|${t.uuid}`
      jobQueue.push({ id: taskId, rotinaPath: t.path, parameteros: t.parametros })
    })
    handleTarefas.tarefasAgendadas[t.uuid] = job
  })
}

handleTarefas.cancel = uuid => {
  handleTarefas.tarefasAgendadas[uuid].cancel()
}

handleTarefas.loadData = (uuid, path, configuracao, parametros) => {
  loadTarefaData([{ uuid, path, configuracao, parametros }])
}

handleTarefas.loadCron = (uuid, path, configuracao, parametros, dataInicio, dataFim) => {
  loadTarefaCron([{ uuid, path, configuracao, parametros, data_inicio: dataInicio, data_fim: dataFim }])
}

handleTarefas.carregaTarefasAgendadas = async () => {
  const tarefasData = await db.conn.any(
    `
    SELECT ta.uuid, ta.data_execucao AS configuracao, ta.parametros, vr.path
    FROM fme.tarefa_agendada_data AS ta
    INNER JOIN (SELECT *, ROW_NUMBER() OVER (PARTITION BY rotina_id ORDER BY data DESC) rn FROM fme.versao_rotina) AS vr
    ON vr.rotina_id = ta.rotina_id
    WHERE vr.rn = 1 AND ta.data_execucao > now()
    `
  )
  if (tarefasData.length > 0) {
    loadTarefaData(tarefasData)
  }

  const tarefasCron = await db.conn.any(
    `
    SELECT ta.uuid, ta.configuracao_cron AS configuracao, ta.parametros, vr.path,
    ta.data_inicio, ta.data_fim
    FROM fme.tarefa_agendada_cron AS ta
    INNER JOIN (SELECT *, ROW_NUMBER() OVER (PARTITION BY rotina_id ORDER BY data DESC) rn FROM fme.versao_rotina) AS vr
    ON vr.rotina_id = ta.rotina_id
    WHERE vr.rn = 1 AND (ta.data_fim IS NULL OR ta.data_fim::timestamp with time zone > now())
    `
  )
  if (tarefasCron.length > 0) {
    loadTarefaCron(tarefasCron)
  }
}

module.exports = handleTarefas
