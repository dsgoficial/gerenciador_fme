"use strict";

const { db } = require("../database");
const { fmeRunner } = require("./workspace_runner");

const controller = {};

controller.get = async last => {
    try {
      let data = await db.task(t => {
        let batch = [];
        if (last) {
          batch.append(
            t.any(
              ```
          SELECT w.name AS workspace_name, w.description AS workspace_description, v.name AS version_name, v.version_date AS version_date,
          v.author AS version_author, v.workspace_path, v.accessible, c.id AS category_id, c.name AS category,name
          FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY workspace_id ORDER BY version_date DESC) rn FROM fme.version WHERE accessible = TRUE) AS v
          INNER JOIN fme.workspace AS w ON v.workspace_id = w.id
          INNER JOIN fme.category AS c ON c.id = w.category_id
          WHERE v.rn = 1
          ```
            )
          );
        } else {
          batch.append(
            t.any(
              ```
          SELECT w.name AS workspace_name, w.description AS workspace_description, v.name AS version_name, v.version_date AS version_date,
          v.author AS version_author, v.workspace_path, v.accessible, c.id AS category_id, c.name AS category,name
          FROM fme.workspace_version AS v
          INNER JOIN fme.workspace AS w ON v.workspace_id = w.id
          INNER JOIN fme.category AS c ON c.id = w.category_id
          ```
            )
          );
        }
        batch.append(
          t.any(
            ```
        SELECT workspace_version_id, name FROM fme.parameter
        ```
          )
        );
        return t.batch(batch);
      });
      data[0].forEach(function(wv) {
        wv.parameters = [];
        wv.path = "fme/" + wv.workspace_path.split("\\").pop();
        data[1].forEach(function(p) {
          if (wv.id === p.workspace_version_id) {
            wv.parameters.push(p.name);
          }
        });
      });

      return { error: null, data: data[0] };
    } catch (error) {
      const err = new Error("Error getting all Versions");
      err.status = 500;
      err.context = "versions_ctrl";
      err.information = {trace: error};
      return { error: err, data: null };
    }
}

controller.update = async (id, name, author, version_date, acessible) => {
  try {
    await db.one(
      ```
      UPDATE fme.version set name =$1, author = $2, version_date = $3, acessible = $4 WHERE id = $5
      ```,
      [name, author, version_date, acessible, id]
    );
    res.status(200).json({ error: null });
  } catch (error) {
      const err;
      if (error.message === "No data returned from the query.") {
        err = new Error("Version not found");
        err.status = 404;
      } else {
        err = new Error("Error updating version");
        err.status = 500;
      }
      err.context = "versions_ctrl";
      err.information = {id, name, author, version_date, acessible, trace:error};
      return { error: err};
  }
};

const updateJob = async (job_uuid, status, time, summary, parameters) => {
  if (!time) {
    time = null;
  }

  const paramtext = [];
  for (let key in parameters) {
    paramtext.push(key + ":" + parameters[key]);
  }
  paramtext = paramtext.join(" | ");

  return db.none(
    ```
    UPDATE fme.job set status =$1, run_time = $2, log = $3, parameters = $4 WHERE job_uuid = $5
    ```,
    [status, time, summary, paramtext, job_uuid]
  );
}

const executeJob = async (job_uuid, workspace_path, parameters) => {
  try {
    let { time, summary } = await fmeRunner(
      workspace_path,
      parameters
    );
    updateJob(job_uuid, 2, time, summary, parameters);
  } catch (err) {
    updateJob(job_uuid, 3, null, [err], parameters);
  }
};

controller.create = async (id, job_uuid, parameters) => {
  try {
    let version = await db.one(
      ```
      SELECT id, workspace_path FROM fme.version WHERE id = $1
      ```, [
      id
    ]);
    await db.none(
      ```
      INSERT INTO fme.job(job_uuid, status, workspace_version_id, run_date) VALUES($1,$2,$3, CURRENT_TIMESTAMP)
      ```,
      [job_uuid, 1, version.id]
    );
    executeJob(job_uuid, version.workspace_path, parameters);
    return { error: null };

  } catch (error) {
    const err;
    if (error.message === "No data returned from the query.") {
      err = new Error("Version not found");
      err.status = 404;
    } else {
      err = new Error("Error executing job");
      err.status = 500;
    }
    err.context = "versions_ctrl";
    err.information = {id, jobId, parameters, trace:error};
    return { error: err };
  }
};

module.exports = controller;
