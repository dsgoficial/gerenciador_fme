import { api } from '../services'

const getData = async () => {
  return api.axiosAll({
    rotinas: api.getData('/rotinas'),
    versoes: api.getData('/rotinas/versoes'),
    categorias: api.getData('/categorias')
  })
}

const atualizaRotina = async (id, nome, descricao, categoriaId, ativa) => {
  return api.put(`/rotinas/${id}`, { nome, descricao, categoria_id: categoriaId, ativa })
}

const deletaRotina = async id => {
  return api.delete(`/rotinas/${id}`)
}

const deletaVersao = async id => {
  return api.delete(`/rotinas/versoes/${id}`)
}

export { getData, atualizaRotina, deletaRotina, deletaVersao }
