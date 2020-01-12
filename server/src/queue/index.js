const Queue = require('better-queue')

const { errorHandler } = require('../utils')
const { db } = require('../database')

const fmeRunner = require('./fme_runner')

const jobQueue = new Queue(
  async (input, cb) => {
    try {
      const summary = await fmeRunner(
        input.rotinaPath,
        input.parametros
      )
      cb(null, summary)
    } catch (err) {
      cb(err, null)
    }
  },
  { concurrent: 3 }
)

const updateJob = async (taskId, status, time, log) => {
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
    log = $<log:json>, tarefa_agendada_uuid = $<agenda>
    WHERE uuid = $<uuid>
    `,
    { status, time, log, uuid, agenda }
  )
}

jobQueue.on('task_finish', (taskId, result, stats) => {
  updateJob(taskId, 2, stats.elapsed, result)
})

jobQueue.on('task_failed', function (taskId, err, stats) {
  errorHandler(err)
  updateJob(taskId, 3, stats.elapsed, null)
})

module.exports = jobQueue
