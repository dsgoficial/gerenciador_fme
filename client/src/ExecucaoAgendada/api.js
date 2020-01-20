import { api } from '../services'

const getExecucao = async () => {
  return api.axiosAll({
    cron: api.getData('/api/execucoes/agendada/cron'),
    data: api.getData('/api/execucoes/agendada/data')
  })
}

export { getExecucao }
