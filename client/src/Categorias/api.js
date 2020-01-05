import { api } from '../services'

const getCategorias = async () => {
  return api.getData('/categorias')
}

const atualizaCategoria = async dados => {
  return api.put(`/categorias/${dados.id}`, dados)
}

const deletaCategoria = async id => {
  return api.delete(`/categorias/${id}`)
}

const criaCategoria = async (dados) => {
  return api.post('/categorias', dados)
}

export { getCategorias, atualizaCategoria, deletaCategoria, criaCategoria }
