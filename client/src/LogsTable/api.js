import { api } from '../services'

const getExecucao = async () => {
  return api.getData('/api/execucoes')
}

export { getExecucao }
