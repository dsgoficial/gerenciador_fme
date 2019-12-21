'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.get = async () => {
  return db.conn.any(
    `
    SELECT j.job_uuid, j.status, s.name as status_name, j.run_date, j.run_time, j.log, j.parameters, w.name as workspace, v.name as version
    FROM fme.job as j INNER JOIN fme.workspace_version AS v ON  j.workspace_version_id = v.id
    INNER JOIN fme.workspace AS w ON w.id = v.workspace_id
    INNER JOIN fme.status AS s ON s.code = j.status
    ORDER BY j.run_date DESC
    `
  )
}

controller.getJobStatus = async uuid => {
  const dados = db.conn.any(
    `
    SELECT j.job_uuid, j.status, j.run_date, j.run_time, j.log, j.parameters,  w.name as workspace, v.name as version
    FROM fme.job as j INNER JOIN fme.workspace_version AS v ON j.workspace_version_id = v.id
    INNER JOIN fme.workspace AS w ON w.id = v.workspace_id WHERE j.job_uuid = $1
    `,
    [uuid]
  )

  if (!dados || dados.length === 0) {
    throw new AppError('Job não encontrado', httpCode.BadRequest)
  }

  return dados
}

module.exports = controller
