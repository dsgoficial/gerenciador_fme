const express = require('express')

const categoriasCtrl = require('../controllers/categorias_ctrl')
const validator = require('../utils/model_validation')

const router = express.Router()

/**
 * @api {get} /categorias Lista todas as categorias
 * @apiVersion 1.0.0
 * @apiName GetAllCategoria
 * @apiGroup Categoria
 * @apiPermission public
 *
 * @apiDescription Utilizado para retornar a lista de categorias
 * 
 * @apiSuccess {Object[]} categorias  Lista de categorias.
 * @apiSuccess {Integer} categorias.id  Id que identifica a categoria.
 * @apiSuccess {String} categorias.nome  Nome da categoria.
 * 
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 200 OK
 *     [{
 *       "id": 1,
 *       "nome": "Hidrografia"
 *     }]
 *
 */
router.get('/', (req, res, next) => {
  categoriasCtrl.get(req, res, next)
})

/**
 * @api {post} /categorias Cria uma nova categoria
 * @apiVersion 1.0.0
 * @apiName CreateCategoria
 * @apiGroup Categoria
 * @apiPermission gerente
 *
 * @apiDescription Utilizado para criar uma nova categoria.
 * 
 * @apiParam {String} nome  Novo nome para a categoria.
 * @apiParamExample {json} Input
 *     {
 *       "nome": "Transportes"
 *     }
 * 
 * @apiSuccess {String} message  Mensagem de sucesso.
 * 
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 201 OK
 *     {
 *       "message": "Categoria inserida com sucesso."
 *     }
 *
 * @apiError NoAccessRight Somente Gerentes autenticados podem criar categorias.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "NoAccessRight"
 *     }
 * 
 * @apiError InvalidInput O objeto enviado como Input não segue o padrão estabelecido.
 *
 * @apiErrorExample InvalidInput:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "InvalidInput",
 *  	 "message": "O objeto enviado como Input não segue o padrão estabelecido."
 *     }
 */
router.post('/', (req, res, next) => {
    categoriasCtrl.post(req, res, next, req.body)
})

/**
 * @api {put} /categorias/:id Atualiza uma categoria
 * @apiVersion 1.0.0
 * @apiName UpdateCategoria
 * @apiGroup Categoria
 * @apiPermission gerente
 *
 * @apiDescription Utilizado para atualizar informações de uma categoria.
 * 
 * @apiParam {Number} id  Id que identifica a categoria.
 * 
 * @apiParam {String} nome  Novo nome para a categoria.
 * @apiParamExample {json} Input
 *     {
 *       "nome": "Vegetação"
 *     }
 * 
 * 
 * @apiSuccess {String} message  Mensagem de sucesso.
 * 
 * @apiSuccessExample {json} Resposta em caso de Sucesso:
 *     HTTP/1.1 201 OK
 *     {
 *       "message": "Categoria atualizada com sucesso."
 *     }
 *
 * @apiError NoAccessRight Somente Gerentes autenticados podem atualizar categorias.
 *
 * @apiErrorExample NoAccessRight:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "NoAccessRight"
 *     }
 * 
 * @apiError CategoriaNotFound O Id da categoria não foi encontrado.
 *
 * @apiErrorExample CategoriaNotFound:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "CategoriaNotFound"
 *     }
 * 
 * @apiError InvalidInput O objeto enviado como Input não segue o padrão estabelecido.
 *
 * @apiErrorExample InvalidInput:
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "InvalidInput",
 *  	 "message": "O objeto enviado como Input não segue o padrão estabelecido."
 * }
 */
router.put('/:id', (req, res, next) => {
    categoriasCtrl.put(req, res, next, req.body, req.params.id)
})



module.exports = router