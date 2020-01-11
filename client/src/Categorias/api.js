import { api } from '../services'

const getCategorias = async () => {
  return api.getData('/api/categorias')
}

const atualizaCategoria = async (id, nome, descricao) => {
  return api.put(`/api/categorias/${id}`, { nome, descricao })
}

const deletaCategoria = async id => {
  return api.delete(`/api/categorias/${id}`)
}

const criaCategoria = async (nome, descricao) => {
  return api.post('/api/categorias', { nome, descricao })
}

export { getCategorias, atualizaCategoria, deletaCategoria, criaCategoria }
