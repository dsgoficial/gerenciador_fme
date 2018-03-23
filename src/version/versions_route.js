const express = require('express')

const versionsCtrl = require('../controllers/versions_ctrl')
const validator = require('../utils/model_validation')

const router = express.Router()

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
router.get('/', (req, res, next) => {
    versionsCtrl.getWorkspacesVersion(req, res, next)
})

router.get('/last', (req, res, next) => {
    versionsCtrl.getLastWorkspacesVersion(req, res, next)
})


router.put('/:id', validator.versions, (req, res, next) => {
  versionsCtrl.putVersion(req, res, next, req.body, req.params.id)
})


//Criar uma nova execução do FME
router.post('/:id/jobs', validator.jobs, (req, res, next) => {
  versionsCtrl.createExecuteJob(req, res, next, req.body, req.params.id)
})

module.exports = router