import { api } from '../services'

const getExecucao = async () => {
  const data = api.getData('/api/execucoes')
  return data.execucoes
}

export { getExecucao }
