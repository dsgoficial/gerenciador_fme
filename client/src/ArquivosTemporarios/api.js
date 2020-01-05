import { api } from '../services'

const deleteFiles = async () => {
  return api.delete('/logs')
}

const getFilesSize = async () => {
  return api.getData('/logs')
}

export { deleteFiles, getFilesSize }
