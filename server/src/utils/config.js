'use strict'

const dotenv = require('dotenv')
const Joi = require('joi')
const fs = require('fs')
const path = require('path')

const AppError = require('./App_error')
const errorHandler = require('./error_handler')

const configFile =
  process.env.NODE_ENV === 'test' ? 'config_testing.env' : 'config.env'

const configPath = path.join(__dirname, '..', '..', configFile)

if (!fs.existsSync(configPath)) {
  errorHandler(
    new AppError(
      'Arquivo de configuração não encontrado. Configure o serviço primeiro.'
    )
  )
}

dotenv.config({
  path: configPath
})

const VERSION = '2.0.0'
const MIN_DATABASE_VERSION = '2.0.0'
const PATH_LOGS = path.join(__dirname, '..', 'fme_workspaces', 'fme_logs')
const PATH_WORKSPACES = path.join(__dirname, '..', 'fme_workspaces')

const configSchema = Joi.object().keys({
  PORT: Joi.number()
    .integer()
    .required(),
  DB_SERVER: Joi.string().required(),
  DB_PORT: Joi.number()
    .integer()
    .required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  AUTH_SERVER: Joi.string()
    .uri()
    .required(),
  FME_PATH: Joi.string().required(),
  VERSION: Joi.string().required(),
  MIN_DATABASE_VERSION: Joi.string().required(),
  PATH_LOGS: Joi.string().required(),
  PATH_WORKSPACES: Joi.string().required()
})

const config = {
  PORT: process.env.PORT,
  DB_SERVER: process.env.DB_SERVER,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  JWT_SECRET: process.env.JWT_SECRET,
  AUTH_SERVER: process.env.AUTH_SERVER,
  FME_PATH: process.env.FME_PATH,
  VERSION,
  MIN_DATABASE_VERSION,
  PATH_LOGS,
  PATH_WORKSPACES
}

const { error } = configSchema.validate(config, {
  abortEarly: false
})
if (error) {
  const { details } = error
  const message = details.map(i => i.message).join(',')

  errorHandler(
    new AppError(
      'Arquivo de configuração inválido. Configure novamente o serviço.',
      null,
      message
    )
  )
}

module.exports = config
