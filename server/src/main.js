'use strict'

const { errorHandler } = require('./utils')
const { startServer } = require('./server')
const { db, databaseVersion } = require('./database')
const { verifyAuthServer } = require('./authentication')
const { handleTarefas } = require('./tarefa_agendada')

db.createConn()
  .then(databaseVersion.load)
  .then(verifyAuthServer)
  .then(startServer)
  .then(handleTarefas.carregaTarefasAgendadas)
  .catch(errorHandler.critical)
