"use strict";

const { db } = require("../database");

const controller = {};

controller.get = async () => {
  try {
    let data = await db.any(
      `
      SELECT j.job_uuid, j.status, j.run_date, j.run_time, j.log, j.parameters, w.name as workspace, v.name as version
      FROM fme.job as j INNER JOIN fme.workspace_version AS v ON  j.workspace_version_id = v.id
      INNER JOIN fme.workspace AS w ON w.id = v.workspace_id
      `
    );
    return { error: null, data: data };
  } catch (error) {
    const err = new Error("Error getting all jobs");
    err.status = 500;
    err.context = "job_ctrl";
    err.information = { trace: error };
    return { error: err, data: null };
  }
};

controller.getJobStatus = async uuid => {
  try {
    let result = await db.result(
      `
     SELECT j.job_uuid, j.status, j.run_date, j.run_time, j.log, j.parameters,  w.name as workspace, v.name as version
     FROM fme.job as j INNER JOIN fme.workspace_version AS v ON j.workspace_version_id = v.id
     INNER JOIN fme.workspace AS w ON w.id = v.workspace_id WHERE j.job_uuid = $1
     `,
      [uuid]
    );
    if (!result.rowCount || result.rowCount < 1) {
      let error = new Error("Job not found.");
      error.status = 404;
      error.context = "job_ctrl";
      error.information = { uuid };
      throw error;
    }
    return { error: null, data: result.rows[0] };
  } catch (error) {
    if (error.message === "Job not found.") {
      return { error: error, data: null };
    } else {
      const err = new Error("Error finding job.");
      err.status = 500;
      err.context = "job_ctrl";
      err.information = { uuid, trace: error };
      return { error: err, data: null };
    }
  }
};

module.exports = controller;
