import { api } from '../services'

const deleteFiles = async () => {
  return api.delete('/api/logs')
}

const getFilesSize = async () => {
  return api.getData('/api/logs')
}

export { deleteFiles, getFilesSize }
