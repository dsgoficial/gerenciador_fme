import { api } from '../services'

const getUsuarios = async () => {
  return api.getData('/usuarios')
}

const getUsuariosAuth = async () => {
  return api.getData('/usuarios/servico_autenticacao?cadastrados=false')
}

const atualizaUsuario = async (uuid, administrador, ativo) => {
  return api.put(`/usuarios/${uuid}`, { administrador, ativo })
}

const deletaUsuario = async uuid => {
  return api.delete(`/usuarios/${uuid}`)
}

const sincronizaUsuarios = async () => {
  return api.put('/usuarios/sincronizar')
}

const importaUsuarios = async uuids => {
  return api.post('/usuarios', { usuarios: uuids })
}

export { getUsuarios, getUsuariosAuth, atualizaUsuario, deletaUsuario, sincronizaUsuarios, importaUsuarios }
