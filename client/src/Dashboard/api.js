import { api } from '../services'

const getDashboardData = async () => {
  return api.axiosAll({
    ultimasExecucoes: api.getData('/api/dashboard/ultimas_execucoes?total=10'),
    execucoesPorDia: api.getData('/api/dashboard/execucoes/dia?total=14'),
    execucoesPorMes: api.getData('/api/dashboard/execucoes/mes?total=12'),
    execucoes: api.getData('/api/dashboard/execucoes'),
    rotinas: api.getData('/api/dashboard/rotinas'),
    execucoesRotinas: api.getData('/api/dashboard/execucoes/rotinas?total=14&max=10'),
    errosRotinas: api.getData('/api/dashboard/erros/rotinas?total=14&max=10'),
    tempoExecucao: api.getData('/api/dashboard/tempo_execucao/rotinas?total=365&max=10')
  })
}

export { getDashboardData }
