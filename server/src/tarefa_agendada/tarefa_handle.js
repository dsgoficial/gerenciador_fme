
const schedule = require('node-schedule')
const uuidv4 = require('uuid/v4')

const { db } = require('../database')
const jobQueue = require('../queue')

const handleTarefas = {}

handleTarefas.tarefasAgendadas = {}

const loadTarefaData = tarefas => {
  tarefas.forEach(t => {
    const job = schedule.scheduleJob(t.data_execucao, () => {
      const jobUuid = uuidv4()
      const taskId = `${jobUuid}|${t.uuid}`
      jobQueue.push({ id: taskId, rotinaPath: t.path, parameteros: t.parametros })
    })
    handleTarefas.tarefasAgendadas[t.uuid] = job
  })
}

handleTarefas.carregaTarefaAgendada = async () => {
  const tarefasData = await db.conn.any(
    `
    SELECT ta.uuid, ta.data_execucao AS configuracao, ta.parametros, vr.path
    FROM fme.tarefa_agendada_data AS ta
    INNER JOIN fme.rotina AS r ON ta.rotina_id = r.id
    INNER JOIN (SELECT *, ROW_NUMBER() OVER (PARTITION BY rotina_id ORDER BY data DESC) rn FROM fme.versao_rotina) AS vr
    ON vr.rotina_id = ta.rotina_id
    WHERE vr.rn = 1 AND r.ativa IS TRUE AND ta.data_execucao > now()
    `
  )
  const tarefasCron = await db.conn.any(
    `
    SELECT ta.uuid, ta.configuracao_cron AS configuracao, ta.parametros, vr.path
    FROM fme.tarefa_agendada_cron AS ta
    INNER JOIN fme.rotina AS r ON ta.rotina_id = r.id
    INNER JOIN (SELECT *, ROW_NUMBER() OVER (PARTITION BY rotina_id ORDER BY data DESC) rn FROM fme.versao_rotina) AS vr
    ON vr.rotina_id = ta.rotina_id
    WHERE vr.rn = 1 AND r.ativa IS TRUE
    `
  )

  const tarefas = [...tarefasData, ...tarefasCron]
  if (tarefas.length > 0) {
    loadTarefaData(tarefas)
  }
}

module.exports = handleTarefas
