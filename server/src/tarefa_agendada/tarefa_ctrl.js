'use strict'
const uuidv4 = require('uuid/v4')
const cronValidator = require('cron-validator')
const CronConverter = require('cron-converter')

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const { load, cancel } = require('./tarefa_handle')

const controller = {}

controller.get = async () => {
  const tarefaCron = await db.conn.any(`
    SELECT ta.id, ta.uuid, ta.rotina_id, r.nome AS rotina, ta.data_agendamento, ta.usuario_id, ta.configuracao_cron AS configuracao,
    ta.parametros, 'cron' AS tipo, tpg.nome_abrev || ' ' || u.nome_abrev AS usuario
    FROM fme.tarefa_agendada_cron AS ta
    INNER JOIN fme.rotina AS r ON r.id = ta.rotina_id
    LEFT JOIN dgeo.usuario AS u ON u.id = ta.usuario_id
    LEFT JOIN dominio.tipo_posto_grad_id AS tpg ON tpg.code = u.tipo_posto_grad_id
  `)
  if (tarefaCron) {
    tarefaCron.forEach(t => {
      const cronInstance = new CronConverter()
      cronInstance.fromString(t.configuracao)
      const schedule = cronInstance.schedule()
      t.proxima_execucao = schedule.next().format()
    })
  }

  const tarefaData = await db.conn.any(`
    SELECT ta.id, ta.uuid, ta.rotina_id, r.nome AS rotina, ta.data_agendamento, ta.usuario_id, ta.data_execucao AS configuracao,
    ta.parametros, 'data' AS tipo, tpg.nome_abrev || ' ' || u.nome_abrev AS usuario
    FROM fme.tarefa_agendada_data AS ta
    INNER JOIN fme.rotina AS r ON r.id = ta.rotina_id
    LEFT JOIN dgeo.usuario AS u ON u.id = ta.usuario_id
    LEFT JOIN dominio.tipo_posto_grad_id AS tpg ON tpg.code = u.tipo_posto_grad_id
  `)
  if (tarefaData) {
    tarefaData.forEach(t => {
      t.proxima_execucao = t.configuracao
    })
  }

  return [...tarefaCron, ...tarefaData]
}

controller.insert = async (usuarioUuid, rotinaId, configuracao, parametros, tipo) => {
  return db.conn.tx(async t => {
    const usuario = await t.oneOrNone('SELECT id FROM dgeo.usuario WHERE uuid = $<usuarioUuid>', { usuarioUuid })

    if (!usuario) {
      throw new AppError('Usuário inválido', httpCode.BadRequest)
    }

    let sql
    if (tipo === 'cron') {
      const validCron = cronValidator.isValidCron(configuracao)
      if (!validCron) {
        throw new AppError('Formato inválido para descrição do Cron', httpCode.BadRequest)
      }
      sql = `INSERT INTO fme.tarefa_agendada_cron(uuid, rotina_id, data_agendamento, usuario_id, configuracao_cron, parametros) 
      VALUES($<uuid>, $<rotinaId>, now(), $<usuarioId>, $<configuracao>, $<parametros:json>)`
    } else {
      sql = `INSERT INTO fme.tarefa_agendada_data(uuid, rotina_id, data_agendamento, usuario_id, data_execucao, parametros) 
      VALUES($<uuid>, $<rotinaId>, now(), $<usuarioId>, $<configuracao>, $<parametros:json>)`
    }
    const tarefaUuid = uuidv4()
    await t.none(sql, {
      uuid: tarefaUuid,
      rotinaId,
      usuarioId: usuario.id,
      configuracao,
      parametros
    })

    const rotina = await t.oneOrNone(`SELECT vr.path
    FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY rotina_id ORDER BY data DESC) rn FROM fme.versao_rotina) AS vr
    INNER JOIN fme.rotina AS r ON vr.rotina_id = r.id
    WHERE vr.rn = 1 AND vr.rotina_id = $<rotinaId> AND r.ativa IS TRUE`, { rotinaId })

    if (!rotina) {
      throw new AppError('Rotina inválida', httpCode.BadRequest)
    }

    load(tarefaUuid, rotina.path, configuracao, parametros)
  })
}

controller.delete = async uuid => {
  return db.conn.tx(async t => {
    await t.none('DELETE FROM fme.tarefa_agendada_cron WHERE uuid = $<uuid>', {
      uuid
    })
    await t.none('DELETE FROM fme.tarefa_agendada_data WHERE uuid = $<uuid>', {
      uuid
    })

    cancel(uuid)
  })
}

module.exports = controller
