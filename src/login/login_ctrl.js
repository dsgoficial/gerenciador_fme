'use strict'

const jwt = require('jsonwebtoken')

const { db } = require('../database')

const {
  AppError,
  httpCode,
  config: { JWT_SECRET }
} = require('../utils')

const { authenticateUser } = require('../authentication')

const controller = {}

const signJWT = (data, secret) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      data,
      secret,
      {
        expiresIn: '10h'
      },
      (err, token) => {
        if (err) {
          reject(new AppError('Erro durante a assinatura do token', null, err))
        }
        resolve(token)
      }
    )
  })
}

controller.login = async (usuario, senha) => {
  const usuarioDb = await db.conn.oneOrNone(
    'SELECT id, administrator FROM fme.usuario WHERE login = $<usuario> and active IS TRUE',
    { usuario }
  )
  if (!usuarioDb) {
    throw new AppError(
      'Usuário não autorizado para utilizar o Gerenciador do FME',
      httpCode.Unauthorized
    )
  }

  const verifyAuthentication = await authenticateUser(usuario, senha)
  if (!verifyAuthentication) {
    throw new AppError('Usuário ou senha inválida', httpCode.Unauthorized)
  }

  const { id, administrator } = usuarioDb

  const token = await signJWT({ id, administrator }, JWT_SECRET)

  return { token, administrator }
}

module.exports = controller
