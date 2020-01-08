import { api } from '../services'

const getCategorias = async () => {
  return api.getData('/categorias')
}

const atualizaCategoria = async (id, nome, descricao) => {
  return api.put(`/categorias/${id}`, { nome, descricao })
}

const deletaCategoria = async id => {
  return api.delete(`/categorias/${id}`)
}

const criaCategoria = async (nome, descricao) => {
  return api.post('/categorias', { nome, descricao })
}

export { getCategorias, atualizaCategoria, deletaCategoria, criaCategoria }
