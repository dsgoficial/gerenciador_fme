'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getExecucaoPagination = async (pagina, totalPagina, colunaOrdem, direcaoOrdem, filtro) => {
  let where = ''

  if (filtro) {
    where = ` WHERE lower(concat_ws('|',e.uuid,s.nome,e.data_execucao,e.tempo_execucao, e.sumario, e.parametros,COALESCE(r.nome, 'Rotina deletada'), COALESCE(vr.nome::text, 'Versão deletada'))) LIKE '%${filtro.toLowerCase()}%'`
  }

  let sort = ''
  if (colunaOrdem) {
    if (direcaoOrdem) {
      sort = ` ORDER BY e.${colunaOrdem} ${direcaoOrdem}`
    } else {
      sort = ` ORDER BY e.${colunaOrdem} ASC`
    }
  }

  let paginacao = ''

  if (pagina && totalPagina) {
    paginacao = ` LIMIT ${totalPagina} OFFSET (${pagina} - 1)*${totalPagina}`
  }

  const sql = `SELECT e.uuid, s.nome AS status, e.data_execucao, e.tempo_execucao, e.sumario, e.log, e.parametros,
  COALESCE(r.nome, 'Rotina deletada') AS rotina, COALESCE(vr.nome::text, 'Versão deletada') AS versao_rotina
  FROM fme.execucao AS e
  INNER JOIN dominio.status AS s ON s.code = e.status_id
  LEFT JOIN fme.versao_rotina AS vr ON vr.id = e.versao_rotina_id
  LEFT JOIN fme.rotina AS r ON r.id = e.rotina_id
  ${where} ${sort} ${paginacao}`

  const execucoes = await db.conn.any(sql)

  const total = execucoes.length

  return { execucoes, total }
}

controller.getExecucaoStatus = async uuid => {
  const dados = await db.conn.oneOrNone(
    `
    SELECT e.uuid, s.nome AS status, e.data_execucao, e.tempo_execucao, e.sumario, e.parametros,
    COALESCE(r.nome, 'Rotina deletada') AS rotina, COALESCE(vr.nome::text, 'Versão deletada')::text AS versao_rotina
    FROM fme.execucao AS e
    INNER JOIN dominio.status AS s ON s.code = e.status_id
    LEFT JOIN fme.versao_rotina AS vr ON vr.id = e.versao_rotina_id
    LEFT JOIN fme.rotina AS r ON r.id = e.rotina_id
    WHERE e.uuid = $<uuid>
    `,
    { uuid }
  )

  if (!dados) {
    throw new AppError('Informação de execução não encontrada', httpCode.BadRequest)
  }

  return dados
}

controller.getExecucaoAgendadaCron = async () => {
  return db.conn.any(
    `
    SELECT s.nome AS status, e.data_execucao, e.tempo_execucao, e.sumario, e.log, e.parametros,
    COALESCE(r.nome, 'Rotina deletada') AS rotina, COALESCE(vr.nome::text, 'Versão deletada') AS versao_rotina,
    ta.nome AS agendamento
    FROM fme.execucao AS e
    INNER JOIN fme.tarefa_agendada_cron AS ta ON ta.uuid = e.tarefa_agendada_uuid
    INNER JOIN dominio.status AS s ON s.code = e.status_id
    LEFT JOIN fme.versao_rotina AS vr ON vr.id = e.versao_rotina_id
    LEFT JOIN fme.rotina AS r ON r.id = e.rotina_id
    `
  )
}

controller.getExecucaoAgendadaData = async () => {
  return db.conn.any(
    `
    SELECT s.nome AS status, e.data_execucao, e.tempo_execucao, e.sumario, e.log, e.parametros,
    COALESCE(r.nome, 'Rotina deletada') AS rotina, COALESCE(vr.nome::text, 'Versão deletada') AS versao_rotina,
    ta.nome AS agendamento
    FROM fme.execucao AS e
    INNER JOIN fme.tarefa_agendada_data AS ta ON ta.uuid = e.tarefa_agendada_uuid
    INNER JOIN dominio.status AS s ON s.code = e.status_id
    LEFT JOIN fme.versao_rotina AS vr ON vr.id = e.versao_rotina_id
    LEFT JOIN fme.rotina AS r ON r.id = e.rotina_id
    `
  )
}

module.exports = controller
