import { api } from '../services'

const getUsuarios = async () => {
  return api.getData('/api/usuarios')
}

const getUsuariosAuth = async () => {
  return api.getData('/api/usuarios/servico_autenticacao')
}

const atualizaUsuario = async (uuid, administrador, ativo) => {
  return api.put(`/api/usuarios/${uuid}`, { administrador, ativo })
}

const deletaUsuario = async uuid => {
  return api.delete(`/api/usuarios/${uuid}`)
}

const sincronizaUsuarios = async () => {
  return api.put('/api/usuarios/sincronizar')
}

const importaUsuarios = async uuids => {
  return api.post('/api/usuarios', { usuarios: uuids })
}

export { getUsuarios, getUsuariosAuth, atualizaUsuario, deletaUsuario, sincronizaUsuarios, importaUsuarios }
