import { api } from '../services'

const handleUpload = async (
  file,
  rotinaId
) => {
  const formData = new window.FormData()
  formData.append('rotina', file)
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
  return api.post(`rotinas/${rotinaId}/versao`, formData, config)
}

const getRotinas = async () => {
  return api.getData('/rotinas')
}

export { handleUpload, getRotinas }
