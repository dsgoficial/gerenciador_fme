"use strict";

const express = require("express");
const Joi = require("joi");

const { sendJsonAndLog } = require("../logger");

const { loginMiddleware } = require("../login");

const jobsCtrl = require("./jobs_ctrl");

const router = express.Router();

/**
 * @api {get} /jobs List all the jobs
 * @apiVersion 1.0.0
 * @apiName GetAllJobs
 * @apiGroup Job
 * @apiPermission Manager
 *
 * @apiDescription Used to return a list of jobs
 *
 * @apiSuccess {Object[]} jobs  List of jobs.
 * @apiSuccess {UUID} jobs.job_uuid  UUID that identifies the job.
 * @apiSuccess {String} jobs.status  Execution status.
 * @apiSuccess {String} jobs.workspace  Workspace name.
 * @apiSuccess {String} jobs.version  Version name.
 * @apiSuccess {Timestamp} jobs.run_date  Date and timestamp of the begging of the execution of the job.
 * @apiSuccess {Number} jobs.run_time  Run time in seconds of the job.
 * @apiSuccess {String} jobs.log  Log created at job execution.
 * @apiSuccess {String} jobs.parameters  Parameters for job execution.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       "job_uuid": "3b2c3696-eeb0-4b88-86c5-79cdc7b98d3d",
 *       "status": "Succeeded",
 *       "workspace": "Ponta livre de Vegetação",
 *       "version": "2",
 *       "run_date": "2017-10-16T00:38:40.637Z",
 *       "run_time": 58.02,
 *       "log": "edgv.aux_valida_a:18 | edgv.aux_valida_p:517",
 *       "parameters": "db_SourceDataset_POSTGIS:mi_2906-1-se"
 *     }]
 *
 * @apiError NoAccessRight Only managers can access the data.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "NoAccessRight"
 *     }
 */
router.get("/", loginMiddleware, async (req, res, next) => {
  let { error, data } = await jobsCtrl.get();
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Jobs returned",
    "jobs_route",
    null,
    res,
    200,
    data
  );
});

/**
 * @api {get} /jobs/:id Requisição de informação sobre uma tarefa
 * @apiVersion 1.0.0
 * @apiName GetJob
 * @apiGroup Job
 * @apiPermission Public
 *
 * @apiDescription Utilizado para verificar o andamento de uma tarefa em execução.
 *
 * @apiParam {Number} id UUID que identifica a tarefa.
 *
 * @apiSuccess {UUID} jobs.job_uuid  UUID that identifies the job.
 * @apiSuccess {String} jobs.status  Execution status.
 * @apiSuccess {String} jobs.workspace  Workspace name.
 * @apiSuccess {String} jobs.version  Version name.
 * @apiSuccess {Timestamp} jobs.run_date  Date and timestamp of the begging of the execution of the job.
 * @apiSuccess {Number} jobs.run_time  Run time in seconds of the job.
 * @apiSuccess {String} jobs.log  Log created at job execution.
 * @apiSuccess {String} jobs.parameters  Parameters for job execution.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "job_uuid": "3b2c3696-eeb0-4b88-86c5-79cdc7b98d3d",
 *       "status": "Succeeded",
 *       "workspace": "Ponta livre de Vegetação",
 *       "version": "2",
 *       "run_date": "2017-10-16T00:38:40.637Z",
 *       "run_time": 58.02,
 *       "log": "edgv.aux_valida_a:18 | edgv.aux_valida_p:517",
 *       "parameters": "db_SourceDataset_POSTGIS:mi_2906-1-se"
 *     }
 *
 * @apiError JobNotFound O Id da tarefa não foi encontrado.
 *
 * @apiErrorExample JobNotFound:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "JobNotFound"
 *     }
 */
router.get("/:uuid", async (req, res, next) => {
  let { error, data } = await jobsCtrl.getJobStatus(req.params.uuid);
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Job information returned",
    "jobs_route",
    {
      uuid: req.params.uuid
    },
    res,
    200,
    data
  );
});

module.exports = router;
