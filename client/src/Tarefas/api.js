import { api } from '../services'

const getTarefas = async () => {
  return api.axiosAll({
    cron: api.getData('/api/tarefas/cron'),
    data: api.getData('/api/tarefas/data')
  })
}

const getRotinas = async () => {
  return api.getData('/api/rotinas')
}

const criaTarefaCron = async (rotinaId, nome, configuracao, parametros, dataInicio, dataFim) => {
  return api.post('/api/tarefas/cron', { rotina_id: rotinaId, nome, configuracao, parametros, data_inicio: dataInicio, data_fim: dataFim })
}

const criaTarefaData = async (rotinaId, nome, configuracao, parametros) => {
  return api.post('/api/tarefas/data', { rotina_id: rotinaId, nome, configuracao, parametros })
}

const deletaTarefaCron = async uuid => {
  return api.delete(`/api/tarefas/cron/${uuid}`)
}

const deletaTarefaData = async uuid => {
  return api.delete(`/api/tarefas/data/${uuid}`)
}

export { getTarefas, getRotinas, criaTarefaCron, criaTarefaData, deletaTarefaCron, deletaTarefaData }
