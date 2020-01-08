'use strict'

const axios = require('axios')

const {
  AppError,
  httpCode,
  config: { AUTH_SERVER }
} = require('../utils')

const getUsuarios = async (usuario, senha, cliente) => {
  const server = `${AUTH_SERVER}/usuarios`
  try {
    const response = await axios.get(server)

    if (!response || response.status !== 200 || !('data' in response) || !('dados' in response.data)) {
      throw new Error()
    }

    return response.data.dados
  } catch (err) {
    if (
      'response' in err &&
      'data' in err.response &&
      'message' in err.response.data
    ) {
      throw new AppError(
        err.response.data.message,
        httpCode.BadRequest
      )
    } else {
      throw new AppError(
        'Erro ao se comunicar com o servidor de autenticação'
      )
    }
  }
}

module.exports = getUsuarios
