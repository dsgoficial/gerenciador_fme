import { api } from '../services'

const handleUpload = async (
  file,
  nome,
  descricao,
  categoria
) => {
  const formData = new window.FormData()
  formData.append('rotina', file)
  formData.append('nome', nome)
  formData.append('descricao', descricao)
  formData.append('categoria', categoria)
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
  return api.post('/rotinas', formData, config)
}

const getCategorias = async () => {
  return api.getData('/categorias')
}

export { handleUpload, getCategorias }
