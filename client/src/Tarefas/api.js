import { api } from '../services'

const getTarefas = async () => {
  return api.getData('/api/tarefas')
}

const getRotinas = async () => {
  return api.getData('/api/rotinas')
}

const criaTarefa = async (rotinaId, configuracao, parametros, tipo) => {
  return api.put('/api/tarefas', { rotina_id: rotinaId, configuracao, parametros, tipo })
}

const deletaTarefa = async uuid => {
  return api.delete(`/api/tarefas/${uuid}`)
}

export { getTarefas, getRotinas, criaTarefa, deletaTarefa }
