import { api } from '../services'

const getData = async () => {
  return api.axiosAll({
    rotinas: api.getData('/api/rotinas'),
    versoes: api.getData('/api/rotinas/versoes'),
    categorias: api.getData('/api/categorias')
  })
}

const atualizaRotina = async (id, nome, descricao, categoriaId, ativa) => {
  return api.put(`/api/rotinas/${id}`, { nome, descricao, categoria_id: categoriaId, ativa })
}

const deletaRotina = async id => {
  return api.delete(`/api/rotinas/${id}`)
}

const deletaVersao = async id => {
  return api.delete(`/api/rotinas/versoes/${id}`)
}

export { getData, atualizaRotina, deletaRotina, deletaVersao }
