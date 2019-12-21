'use strict'

const Queue = require('better-queue')

const { db } = require('../database')

const getParams = require('./workspace_parse')

const fmeRunner = require('./workspace_runner')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.get = async () => {
  return db.conn.any(
    'SELECT id, name, description, category_id FROM fme.workspace'
  )
}

controller.update = async (id, name, description, categoryId) => {
  const result = db.conn.result(
    `UPDATE fme.workspace SET name =$<name>, description =$<description>, 
    category_id =$<categoryId> WHERE id = $<id>`,
    { id, name, description, categoryId }
  )
  if (!result.rowCount || result.rowCount !== 1) {
    throw new AppError('Workspace não encontrada', httpCode.BadRequest)
  }
}

controller.saveWorkspace = async (
  workspacePath,
  versionName,
  versionDate,
  versionAuthor,
  name,
  description,
  categoryId,
  workspaceId
) => {
  const params = getParams(workspacePath)

  await db.tx(async t => {
    if (!workspaceId) {
      const workspace = await t.one(
        `
        INSERT INTO fme.workspace(name, description, category_id) VALUES($1,$2,$3) RETURNING id
        `,
        [name, description, categoryId]
      )
      workspaceId = workspace.id
    }

    versionDate = new Date(versionDate).toISOString()

    const version = await t.one(
      `
      INSERT INTO fme.workspace_version(workspace_id, name, version_date, author, workspace_path, accessible)
      VALUES($1,$2,$3,$4,$5,TRUE) RETURNING id
      `,
      [workspaceId, versionName, versionDate, versionAuthor, workspacePath]
    )
    const queries = []
    params.forEach(p => {
      queries.push(
        t.none(
          `
          INSERT INTO fme.parameters(workspace_version_id, name)
          VALUES($1, $2)
          `,
          [version.id, p]
        )
      )
    })
    return t.batch(queries)
  })
}

const updateJob = async (jobUuid, status, time, summary, parameters) => {
  let paramtext = []
  for (const key in parameters) {
    paramtext.push(key + ':' + parameters[key])
  }
  paramtext = paramtext.join(' | ')

  summary = summary.join(' | ')

  return db.conn.none(
    `
    UPDATE fme.job set status =$1, run_time = $2, log = $3, parameters = $4 WHERE job_uuid = $5
    `,
    [status, time, summary, paramtext, jobUuid]
  )
}

const jobQueue = new Queue(
  async (input, cb) => {
    try {
      const { time, summary } = await fmeRunner(
        input.workspace_path,
        input.parameters
      )
      console.log({ time, summary })
      cb(null, { time, summary })
    } catch (err) {
      cb(err, null)
    }
  },
  { concurrent: 3 }
)

controller.getVersions = async (last, category, workspace) => {
  const data = await db.conn.task(t => {
    const batch = []
    if (last) {
      batch.push(
        t.any(
          `
          SELECT v.id, w.id AS workspace_id, w.name AS workspace_name, w.description AS workspace_description, v.name AS version_name, v.version_date AS version_date,
          v.author AS version_author, v.workspace_path, v.accessible, c.id AS category_id, c.name AS category_name
          FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY workspace_id ORDER BY version_date DESC) rn FROM fme.workspace_version WHERE accessible = TRUE) AS v
          INNER JOIN fme.workspace AS w ON v.workspace_id = w.id
          INNER JOIN fme.category AS c ON c.id = w.category_id
          WHERE v.rn = 1
          `
        )
      )
    } else {
      batch.push(
        t.any(
          `
          SELECT v.id, w.id AS workspace_id, w.name AS workspace_name, w.description AS workspace_description, v.name AS version_name, v.version_date AS version_date,
          v.author AS version_author, v.workspace_path, v.accessible, c.id AS category_id, c.name AS category_name
          FROM fme.workspace_version AS v
          INNER JOIN fme.workspace AS w ON v.workspace_id = w.id
          INNER JOIN fme.category AS c ON c.id = w.category_id
          `
        )
      )
    }
    batch.push(
      t.any(
        `
        SELECT workspace_version_id, name FROM fme.parameters
        `
      )
    )
    return t.batch(batch)
  })
  data[0].forEach(function (wv) {
    wv.parameters = []
    wv.workspace_path = 'fme/' + wv.workspace_path.split('\\').pop()
    data[1].forEach(function (p) {
      if (wv.id === p.workspace_version_id) {
        wv.parameters.push(p.name)
      }
    })
  })
  if (category) {
    const cats = category.split(',')
    data[0] = data[0].filter(e => {
      return cats.some(cat => cat === e.category_id)
    })
  }
  if (workspace) {
    const works = workspace.split(',')
    data[0] = data[0].filter(e => {
      return works.some(work => work === e.workspace_id)
    })
  }

  return data[0]
}

controller.updateVersion = async (
  id,
  name,
  author,
  versionDate,
  accessible
) => {
  const result = await db.conn.result(
    `
      UPDATE fme.workspace_version set name =$1, author = $2, version_date = $3, accessible = $4 WHERE id = $5
      `,
    [name, author, versionDate, accessible, id]
  )
  if (!result.rowCount || result.rowCount < 1) {
    throw new AppError('Versão não encontrada', httpCode.BadRequest)
  }
}

controller.executeWorkspace = async (id, jobUuid, parameters) => {
  const version = await db.conn.one(
    `
      SELECT id, workspace_path FROM fme.workspace_version WHERE id = $1
      `,
    [id]
  )
  await db.conn.none(
    `
      INSERT INTO fme.job(job_uuid, status, workspace_version_id, run_date) VALUES($1,$2,$3, CURRENT_TIMESTAMP)
      `,
    [jobUuid, 1, version.id]
  )
  jobQueue
    .push({ workspace_path: version.workspace_path, parameters: parameters })
    .on('finish', async result => {
      console.log('finish')
      await updateJob(jobUuid, 2, result.time, result.summary, parameters)
    })
    .on('failed', async err => {
      console.log('failed')
      await updateJob(jobUuid, 3, null, [err], parameters)
    })
}

module.exports = controller
