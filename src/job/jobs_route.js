const express = require('express')

const jobsCtrl = require('../controllers/jobs_ctrl')

const router = express.Router()

/**
 * @api {get} /jobs Lista todas as tarefas
 * @apiVersion 1.0.0
 * @apiName GetAllJob
 * @apiGroup Job
 * @apiPermission gerente
 *
 * @apiDescription Utilizado para retornar a lista de tarefas 
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
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
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
router.get('/', (req, res, next) => {
  jobsCtrl.get(req, res, next)
})

/**
 * @api {get} /jobs/:id Requisição de informação sobre uma tarefa
 * @apiVersion 1.0.0
 * @apiName GetJob
 * @apiGroup Job
 * @apiPermission public
 *
 * @apiDescription Utilizado para verificar o andamento de uma tarefa em execução.
 * 
 * @apiParam {Number} id UUID que identifica a tarefa.
 *
 * @apiSuccess {UUID} jobid UUID que identifica a tarefa.
 * @apiSuccess {String} status  Status de execução da tarefa.
 * @apiSuccess {String} workspace  Nome da workspace da tarefa.
 * @apiSuccess {String} versao  Nome da versão da workspace.
 * @apiSuccess {Timestamp} data  Data e hora de inicio de execução da tarefa.
 * @apiSuccess {Number} duracao  Tempo em segundos da execução da tarefa.
 * @apiSuccess {String} log  Log de execução da tarefa.
 * @apiSuccess {String} parametros  Parâmetros de entrada da tarefa.
 * 
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 200 OK
 *     {
 *       "jobid": "3b2c3696-eeb0-4b88-86c5-79cdc7b98d3d",
 *       "status": "Executado",
 *       "workspace": "Ponta livre de Vegetação",
 *       "versao": "2",
 *       "data": "2017-10-16T00:38:40.637Z",
 *       "duracao": 58.02,
 *       "log": "public.aux_valida_a:18 | public.aux_valida_p:517",
 *       "parametros": "db_SourceDataset_POSTGIS:mi_2906-1-se"
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
router.get('/:id', (req, res, next) => {
  jobsCtrl.getJobStatus(req, res, next, req.params.id)
})

module.exports = router