'use strict'

const jwt = require('jsonwebtoken')

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const { JWT_SECRET } = require('../config')

const { authenticateUser } = require('../authentication')

const controller = {}

const signJWT = (data, secret) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      data,
      secret,
      {
        expiresIn: '1h'
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

controller.login = async (login, senha, aplicacao) => {
  const usuarioDb = await db.conn.oneOrNone(
    'SELECT uuid, administrador FROM dgeo.usuario WHERE login = $<login> and ativo IS TRUE',
    { login }
  )
  if (!usuarioDb) {
    throw new AppError(
      'Usuário não autorizado para utilizar o Gerenciador do FME',
      httpCode.BadRequest
    )
  }

  const verifyAuthentication = await authenticateUser(login, senha, aplicacao)
  if (!verifyAuthentication) {
    throw new AppError('Usuário ou senha inválida', httpCode.BadRequest)
  }

  const { uuid, administrador } = usuarioDb

  const token = await signJWT({ uuid, administrador }, JWT_SECRET)

  return { token, administrador, uuid }
}

module.exports = controller
