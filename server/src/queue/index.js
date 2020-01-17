const Queue = require('better-queue')

const { errorHandler } = require('../utils')
const { db } = require('../database')

const { fmeRunner, FMEError } = require('./fme_runner')

const jobQueue = new Queue(
  async (input, cb) => {
    try {
      const result = await fmeRunner(
        input.rotinaPath,
        input.parametros
      )
      cb(null, result)
    } catch (err) {
      cb(err, null)
    }
  },
  { concurrent: 3 }
)

const updateJob = async (taskId, status, time, log = null, summary = null) => {
  let uuid
  let agenda = null
  if (taskId.includes('|')) {
    uuid = taskId.split('|')[0]
    agenda = taskId.split('|')[1]
  } else {
    uuid = taskId
  }

  return db.conn.none(
    `
    UPDATE fme.execucao SET status = $<status>, tempo_execucao = $<time>,
    sumario = $<summary:json>, log = $<log>, tarefa_agendada_uuid = $<agenda>
    WHERE uuid = $<uuid>
    `,
    { status, time, summary, log, uuid, agenda }
  )
}

jobQueue.on('task_finish', (taskId, result, stats) => {
  updateJob(taskId, 2, stats.elapsed, result.log, result.summary)
})

jobQueue.on('task_failed', function (taskId, err, stats) {
  errorHandler(err)
  if (err instanceof FMEError) {
    updateJob(taskId, 3, stats.elapsed, err.log)
  } else {
    updateJob(taskId, 3, stats.elapsed)
  }
})

module.exports = jobQueue
