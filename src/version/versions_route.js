"use strict";

const express = require("express");
const Joi = require("joi");
const uuid = require("uuid/v4");

const { sendJsonAndLog } = require("../logger");

const versionsCtrl = require("./versions_ctrl");
const versionsModel = require("./versions_model");

const router = express.Router();

/**
 * @api {get} /versions Lista todas as versões de workspaces
 * @apiVersion 1.0.0
 * @apiName GetAllVersions
 * @apiGroup Version
 * @apiPermission gerente
 *
 * @apiDescription Utilizado para retornar a lista de versões
 *
 * @apiSuccess {Object[]} jobs  Lista de tarefas.
 * @apiSuccess {UUID} jobs.jobid  UUID que identifica a tarefa.
 * @apiSuccess {String} jobs.status  Status de execução da tarefa.
 * @apiSuccess {String} jobs.workspace  Nome da workspace da tarefa.
 * @apiSuccess {String} jobs.versao  Nome da versão da workspace.
 * @apiSuccess {Timestamp} jobs.data  Data e hora de inicio de execução da tarefa.
 * @apiSuccess {Number} jobs.duracao  Tempo em segundos da execução da tarefa.
 * @apiSuccess {String} jobs.log  Log de execução da tarefa.
 * @apiSuccess {String} jobs.parametros  Parâmetros de entrada da tarefa.
 *
 * @apiSuccessExample Resposta em caso de Sucesso:
 *     HTTP/1.1 200 OK
 *     [{
 *       "jobid": "3b2c3696-eeb0-4b88-86c5-79cdc7b98d3d",
 *       "status": "Executado",
 *       "workspace": "Ponta livre de Vegetação",
 *       "versao": "2",
 *       "data": "2017-10-16T00:38:40.637Z",
 *       "duracao": 58.02,
 *       "log": "public.aux_valida_a:18 | public.aux_valida_p:517",
 *       "parametros": "db_SourceDataset_POSTGIS:mi_2906-1-se"
 *     }]
 *
 * @apiError NoAccessRight Somente Gerentes autenticados podem acessar os dados.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "NoAccessRight"
 *     }
 */
router.get("/", async (req, res, next) => {
  let { error, data } = await versionsCtrl.get(req.query.last === "true");
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Versions returned",
    "versions_route",
    null,
    res,
    200,
    data
  );
});

router.put("/:id", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, versionsModel.version);
  if (validationResult.error) {
    const err = new Error("Update versions validation error");
    err.status = 400;
    err.context = "versions_route";
    err.information = {
      id: req.params.id,
      body: req.body,
      trace: validationResult.error
    };
    return next(err);
  }

  let { error } = await versionsCtrl.update(
    req.params.id,
    req.body.name,
    req.body.author,
    req.body.version_date,
    req.body.acessible
  );
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Version updated",
    "versions_route",
    {
      id: req.params.id,
      body: req.body
    },
    res,
    200,
    null
  );
});

router.post("/:id/jobs", async (req, res, next) => {
  let validationResult = Joi.validate(req.body, versionsModel.job);
  if (validationResult.error) {
    const err = new Error("Run job validation error");
    err.status = 400;
    err.context = "versions_route";
    err.information = { body: req.body, trace: validationResult.error };
    return next(err);
  }
  let job_uuid = uuid();
  let { error } = await versionsCtrl.create(
    req.params.id,
    job_uuid,
    req.body.parameters
  );
  if (error) {
    return next(error);
  }

  return sendJsonAndLog(
    true,
    "Job created",
    "versions_route",
    {
      id: req.params.id,
      body: req.body
    },
    res,
    201,
    { job_uuid }
  );
});

module.exports = router;
