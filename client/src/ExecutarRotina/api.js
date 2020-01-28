import { api } from '../services'

const acompanhaExec = async uuid => {
  return new Promise((resolve, reject) => {
    let requests = 0
    let completed = false
    const requestLoop = async () => {
      setTimeout(async () => {
        try {
          const response = await api.getData(`/api/execucoes/${uuid}`)
          if (!response || !('status' in response)) {
            throw new Error()
          }
          if (['Executado', 'Erro'].indexOf(response.status) !== -1) {
            completed = true
            return resolve(response)
          }
        } catch (e) {
          completed = true
          return reject(new Error('Erro no servidor'))
        }

        requests += 1
        if (!completed && requests < 100) {
          return requestLoop()
        } else {
          return reject(new Error('Número máximo de tentativas excedido'))
        }
      }, 3000)
    }
    requestLoop()
  })
}

const handleExecute = async (
  rotinaId,
  parametros
) => {
  const response = await api.post(`/api/rotinas/${rotinaId}/execucao`, { parametros })
  if (
    !('status' in response) ||
    response.status !== 201 ||
    !('data' in response) ||
    !('dados' in response.data) ||
    !('job_uuid' in response.data.dados)
  ) {
    throw new Error()
  }
  return acompanhaExec(response.data.dados.job_uuid)
}

const getRotinas = async () => {
  return api.getData('/api/rotinas')
}

export { handleExecute, getRotinas }
