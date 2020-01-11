import { api } from '../services'

const getDashboardData = async () => {
  return api.axiosAll({
    ultimasExecucoes: api.getData('/dashboard/ultimas_execucoes?total=10'),
    execucoesPorDia: api.getData('/dashboard/execucoes/dia?total=14'),
    execucoesPorMes: api.getData('/dashboard/execucoes/mes?total=12'),
    execucoes: api.getData('/dashboard/execucoes'),
    rotinas: api.getData('/dashboard/rotinas'),
    execucoesRotinas: api.getData('/dashboard/execucoes/rotinas?total=14&max=10'),
    errosRotinas: api.getData('/dashboard/erros/rotinas?total=14&max=10'),
    tempoExecucao: api.getData('/dashboard/tempo_execucao/rotinas?total=365&max=10')
  })
}

export { getDashboardData }
