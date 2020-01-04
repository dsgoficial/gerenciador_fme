'use strict'

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getExecucaoPagination = async (pagina, totalPagina, colunaOrdem, direcaoOrdem, filtro) => {
  let where = ''

  if (filtro) {
    where = ` WHERE lower(concat_ws('|',e.uuid,s.nome,e.data_execucao,e.tempo_execucao, e.log, e.parametros,COALESCE(r.nome, 'Rotina deletada'), COALESCE(vr.nome, 'Versão deletada'))) LIKE '%${filtro.toLowerCase()}%'`
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

  const sql = `SELECT e.uuid, s.nome AS status, e.data_execucao, e.tempo_execucao, e.log, e.parametros,
  COALESCE(r.nome, 'Rotina deletada') AS rotina, COALESCE(vr.nome, 'Versão deletada') AS versao_rotina
  FROM fme.execucao AS e
  INNER JOIN dominio.status AS s ON s.code = e.status_id
  LEFT JOIN fme.versao_rotina AS vr ON vr.id = e.versao_rotina_id
  LEFT JOIN fme.rotina AS r ON r.id = e.rotina_id
  ${where} ${sort} ${paginacao}`

  const logs = await db.conn.any(sql)

  const result = { logs }

  result.total = logs.length

  return result
}

controller.getExecucaoStatus = async uuid => {
  const dados = db.conn.oneOrNone(
    `
    SELECT e.uuid, s.nome AS status, e.data_execucao, e.tempo_execucao, e.log, e.parametros,
    COALESCE(r.nome, 'Rotina deletada') AS rotina, COALESCE(vr.nome, 'Versão deletada') AS versao_rotina
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

module.exports = controller
