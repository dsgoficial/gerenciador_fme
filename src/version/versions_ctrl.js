"use strict";

const { db } = require("../database");
const { fmeRunner } = require("./workspace_runner");

const Queue = require('better-queue');

const updateJob = async (job_uuid, status, time, summary, parameters) => {
  let paramtext = [];
  for (let key in parameters) {
    paramtext.push(key + ":" + parameters[key]);
  }
  paramtext = paramtext.join(" | ");

  summary = summary.join(" | ");

  return db.none(
    `
    UPDATE fme.job set status =$1, run_time = $2, log = $3, parameters = $4 WHERE job_uuid = $5
    `,
    [status, time, summary, paramtext, job_uuid]
  );
};

const jobQueue = new Queue(async (input, cb) => {
  try {
    console.log('running')
    let { time, summary } = await fmeRunner(input.workspace_path, input.parameters);
    console.log('complete')
    console.log({time, summary})
    cb(null, {time, summary});
  } catch (err) {
    console.log('catch')
    cb(err,null);
  }
},{ concurrent: 3 })

const controller = {};

controller.get = async (last, category) => {
  try {
    let data = await db.task(t => {
      let batch = [];
      if (last) {
        batch.push(
          t.any(
            `
          SELECT v.id, w.name AS workspace_name, w.description AS workspace_description, v.name AS version_name, v.version_date AS version_date,
          u.name AS version_author, v.workspace_path, v.accessible, c.id AS category_id, c.name AS category_name
          FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY workspace_id ORDER BY version_date DESC) rn FROM fme.workspace_version WHERE accessible = TRUE) AS v
          INNER JOIN fme.workspace AS w ON v.workspace_id = w.id
          INNER JOIN fme.category AS c ON c.id = w.category_id
          INNER JOIN fme.user AS u ON u.id = v.author
          WHERE v.rn = 1
          `
          )
        );
      } else {
        batch.push(
          t.any(
            `
          SELECT v.id, w.name AS workspace_name, w.description AS workspace_description, v.name AS version_name, v.version_date AS version_date,
          u.name AS version_author, v.workspace_path, v.accessible, c.id AS category_id, c.name AS category_name
          FROM fme.workspace_version AS v
          INNER JOIN fme.workspace AS w ON v.workspace_id = w.id
          INNER JOIN fme.category AS c ON c.id = w.category_id
          INNER JOIN fme.user AS u ON u.id = v.author
          `
          )
        );
      }
      batch.push(
        t.any(
          `
        SELECT workspace_version_id, name FROM fme.parameters
        `
        )
      );
      return t.batch(batch);
    });
    data[0].forEach(function(wv) {
      wv.parameters = [];
      wv.workspace_path = "fme/" + wv.workspace_path.split("\\").pop();
      data[1].forEach(function(p) {
        if (wv.id === p.workspace_version_id) {
          wv.parameters.push(p.name);
        }
      });
    });
    if(category){
      let cats = category.split(',')
      data[0] = data[0].filter( e => {
        return cats.some(cat => cat == e.category_id)
      })
    }
    
    return { error: null, data: data[0] };
  } catch (error) {
    const err = new Error("Error getting all Versions");
    err.status = 500;
    err.context = "versions_ctrl";
    err.information = { trace: error };
    return { error: err, data: null };
  }
};

controller.update = async (id, name, author, version_date, accessible) => {
  try {
    let result = await db.result(
      `
      UPDATE fme.workspace_version set name =$1, author = $2, version_date = $3, accessible = $4 WHERE id = $5
      `,
      [name, author, version_date, accessible, id]
    );
    if (!result.rowCount || result.rowCount < 1) {
      let error = new Error("Version not found.");
      error.status = 404;
      error.context = "versions_ctrl";
      error.information = { id };
      throw error;
    }
    return { error: null };
  } catch (error) {
    let err;
    if (error.message === "Version not found.") {
      return { error: error };
    } else {
      err = new Error("Error updating version");
      err.status = 500;
    }
    err.context = "versions_ctrl";
    err.information = {
      id,
      name,
      author,
      version_date,
      accessible,
      trace: error
    };
    return { error: err };
  }
};

controller.create = async (id, job_uuid, parameters) => {
  try {
    let version = await db.one(
      `
      SELECT id, workspace_path FROM fme.workspace_version WHERE id = $1
      `,
      [id]
    );
    await db.none(
      `
      INSERT INTO fme.job(job_uuid, status, workspace_version_id, run_date) VALUES($1,$2,$3, CURRENT_TIMESTAMP)
      `,
      [job_uuid, 1, version.id]
    );
    jobQueue.push({workspace_path: version.workspace_path, parameters: parameters})
      .on('finish', async result => {
        console.log('finish')
        await updateJob(job_uuid, 2, result.time, result.summary, parameters);
      })
      .on('failed', async err => {
        console.log('failed')
        await updateJob(job_uuid, 3, null, [err], parameters);
      })
    return { error: null };
  } catch (error) {
    let err;
    if (error.message === "No data returned from the query.") {
      err = new Error("Version not found");
      err.status = 404;
    } else {
      err = new Error("Error executing job");
      err.status = 500;
    }
    err.context = "versions_ctrl";
    err.information = { id, job_uuid, parameters, trace: error };
    return { error: err };
  }
};

module.exports = controller;
