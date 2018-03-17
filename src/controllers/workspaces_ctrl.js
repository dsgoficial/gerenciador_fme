const db = require('../utils/database_connection')
const pythonRunner = require('../utils/python_runner')
const path = require('path')

const controller = {}

controller.get = async (req,res,next) => {
  let data
  try {
    data = await db.any('SELECT * from fme.workspace')
    res.status(200).json({message: "Workspaces retornados com sucesso.", data})
  } catch (err) {
    return next(err)
  }
}

controller.put = async (req,res,next,body,id) => {
  try {
    await db.any('UPDATE fme.workspace set nome =$1, descricao =$2, categoria_id =$3 WHERE id = $4', [body.nome, body.descricao, body.categoria, id])
    res.status(200).json({message: "Workspace atualizada com sucesso."})
  } catch (err) {
    return next(err)
  }
}

controller.saveVersion = async (req,res,next,body,caminhoWorkspace,id) => {
  caminhoWorkspace = path.resolve(caminhoWorkspace)
  let params
  try {
    params = await pythonRunner.getParams(caminhoWorkspace)
    await db.tx(async t => {
      let data = new Date(body.data).toISOString()
      let versao = await t.one('INSERT INTO fme.versao(workspace, versao, data, autor, path, acessivel) VALUES($1,$2,$3,$4,$5,TRUE) RETURNING id',
        [id, body.versao, data, body.autor, caminhoWorkspace])           

      let queries = []
      params.forEach(p => {
        queries.push(
          t.none('INSERT INTO fme.parametro(workspace_version_id, nome, descricao, opcional, tipo, valores, valordefault) ' + 
                        'VALUES($1,$2,$3,$4,$5,$6,$7)',
            [versao.id, p.nome, p.descricao, p.opcional, p.tipo, p.valores, p.valordefault])   
        )
      })
      return await t.batch(queries)
    })
    
    res.status(200).json({message: "Nova versão inserida com sucesso."})
  } catch (err) {
    return next(err)
  }
}

controller.saveWorkspace = async (req,res,next,body,caminhoWorkspace) => {
  caminhoWorkspace = path.resolve(caminhoWorkspace)
  let params
  try {
    params = await pythonRunner.getParams(caminhoWorkspace)
    await db.tx(async t => {
      let workspace = await t.one('INSERT INTO fme.workspace(nome, descricao, categoria) VALUES($1,$2,$3) RETURNING id',
      [body.nome, body.descricao, body.categoria])
      let data = new Date(body.data).toISOString()
      let versao = await t.one('INSERT INTO fme.versao(workspace, versao, data, autor, path, acessivel) VALUES($1,$2,$3,$4,$5,TRUE) RETURNING id',
        [workspace.id, body.versao, data, body.autor, caminhoWorkspace])           

      let queries = []
      params.forEach(p => {
        queries.push(
          t.none('INSERT INTO fme.parametro(workspace_version_id, nome, descricao, opcional, tipo, valores, valordefault) ' + 
                        'VALUES($1,$2,$3,$4,$5,$6,$7)',
            [versao.id, p.nome, p.descricao, p.opcional, p.tipo, p.valores, p.valordefault])   
        )
      })
      return await t.batch(queries)
    })
    
    res.status(200).json({message: "Nova workspace inserida com sucesso."})
  } catch (err) {
    return next(err)
  }
}

module.exports = controller