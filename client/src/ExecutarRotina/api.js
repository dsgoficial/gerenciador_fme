import { api } from '../services'

const handleExecute = async (
  rotinaId,
  parametros
) => {
  // post para criar job
  // acompanhar job
}

const getRotinas = async () => {
  return api.getData('/api/rotinas')
}

export { handleExecute, getRotinas }
