'use strict'

const { db } = require('../database')

const controller = {}

controller.getUltimasExecucoes = async (total = 10) => {
  return db.conn.any(
    `
    SELECT s.nome AS status, e.data_execucao, e.tempo_execucao
    r.nome AS rotina, vr.nome AS versao_rotina
    FROM fme.execucao AS e
    INNER JOIN dominio.status AS s ON s.code = e.status_id
    INNER JOIN fme.versao_rotina AS vr ON vr.id = e.versao_rotina_id
    INNER JOIN fme.rotina AS r ON r.id = e.rotina_id
    ORDER BY e.data_execucao DESC
    LIMIT $<total:raw>
    `,
    { total }
  )
}

controller.getExecucoesDia = async (total = 14) => {
  const result = await db.conn.any(
    `SELECT day::date AS data_execucao,count(e.id) AS execucoes FROM 
    generate_series((now() - interval '$<total:raw> day')::date, now()::date, interval  '1 day') AS day
    LEFT JOIN fme.execucao AS e ON e.data_execucao::date = day.day::date
    GROUP BY day::date
    ORDER BY day::date
    `,
    { total: total - 1 }
  )
  result.forEach(r => {
    r.execucoes = +r.execucoes
  })

  return result
}

controller.getExecucoesMes = async (total = 12) => {
  const result = await db.conn.any(
    `SELECT date_trunc('month', month.month)::date AS data_execucao, count(e.id) AS execucoes FROM 
    generate_series(date_trunc('month', (date_trunc('month', now()) - interval '$<total:raw> months'))::date, date_trunc('month', now())::date, interval  '1 month') AS month
    LEFT JOIN fme.execucao AS e ON date_trunc('month', e.data_execucao) = date_trunc('month', month.month)
    GROUP BY date_trunc('month', month.month)
    ORDER BY date_trunc('month', month.month)
    `,
    { total: total - 1 }
  )

  result.forEach(r => {
    r.execucoes = +r.execucoes
  })

  return result
}

controller.getExecucoes = async () => {
  const result = await db.conn.one(
    'SELECT count(*) FROM fme.execucao WHERE status_id = 2'
  )

  return result.count
}

controller.getRotinas = async () => {
  const result = await db.conn.one(
    'SELECT count(*) FROM fme.rotina WHERE ativa IS TRUE'
  )

  return result.count
}

const getExecRotinaByStatus = async (status, total, max) => {
  const rotinas = await db.conn.any(
    `SELECT COALESCE(r.nome, 'Rotina deletada') AS rotina, count(e.id) AS execucoes 
    FROM fme.execucao AS e
    LEFT JOIN fme.rotina AS r ON r.id = e.rotina_id
    WHERE e.data_execucao::date >= (now() - interval '$<total:raw> day')::date AND e.status = $<status>
    GROUP BY r.nome
    ORDER BY count(e.id) DESC
    LIMIT $<max:raw>`,
    { status, total: total - 1, max: max - 1 }
  )
  const dados = await db.conn.any(
    `SELECT day::date AS data_execucao,  COALESCE(r.nome, 'Rotina deletada') AS rotina, count(e.id) AS execucoes
    FROM generate_series((now() - interval '$<total:raw> day')::date, now()::date, interval  '1 day') AS day
    LEFT JOIN fme.execucao AS e ON e.data_execucao::date = day.day::date
    LEFT JOIN fme.rotina AS r ON r.id = e.rotina_id
    WHERE e.status = $<status>
    GROUP BY day::date, r.nome
    ORDER BY day::date, r.nome`,
    { status, total: total - 1 }
  )

  const rotinasFixed = []
  rotinas.forEach(r => rotinasFixed.push(r.rotina))

  const resultDict = {}
  dados.forEach(d => {
    if (!(d.data_execucao in resultDict)) {
      resultDict[d.data_execucao] = {}
      resultDict[d.data_execucao].data = d.data_execucao.toISOString().split('T')[0]
      rotinasFixed.forEach(r => {
        resultDict[d.data_execucao][r] = 0
      })
      resultDict[d.data_execucao].outros = 0
    }
    if (rotinasFixed.indexOf(d.rotina) !== -1) {
      resultDict[d.data_execucao][d.rotina] = +d.execucoes
    } else {
      resultDict[d.data_execucao].outros += d.execucoes
    }
  })

  const result = []
  Object.keys(resultDict).forEach(key => {
    result.push(resultDict[key])
  })

  return result
}

controller.getExecucoesRotinas = async (total = 14, max = 10) => {
  return getExecRotinaByStatus(2, total, max)
}

controller.getErrorsRotinas = async (total = 14, max = 10) => {
  return getExecRotinaByStatus(3, total, max)
}

controller.getTempoExecucaoRotinas = async (total = 365, max = 10) => {
  return db.conn.any(
    `SELECT COALESCE(r.nome, 'Rotina deletada') AS rotina, avg(e.tempo_execucao) AS tempo_execucao_medio
    FROM fme.execucao AS e
    LEFT JOIN fme.rotina AS r ON r.id = e.rotina_id
    WHERE e.data_execucao::date >= (now() - interval '$<total:raw> day')::date AND e.status = 2
    GROUP BY r.nome
    ORDER BY avg(e.tempo_execucao) DESC
    LIMIT $<max:raw>`,
    { total: total - 1, max }
  )
}

module.exports = controller
