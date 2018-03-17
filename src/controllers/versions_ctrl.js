const db = require('../utils/database_connection')
const pythonRunner = require('../utils/python_runner')
const uuid = require('uuid/v4')

const controller = {}

controller.getWorkspacesVersion = async (req, res, next) => {
  let data
  try {
    data = await db.task(t => {
      return t.batch([
        t.any('SELECT w.*, v.*, c.nome AS categoria FROM fme.versao AS v INNER JOIN fme.workspace AS w ON v.workspace_id = w.id' +
              ' INNER JOIN fme.categoria AS c ON c.id = w.categoria_id'),
        t.any('SELECT workspace_version_id, nome, descricao, opcional, tipo, valores, valordefault FROM fme.parametro'),
      ]);
    })

    data[0].forEach(function (wv) {
      wv.parametros = [];
      wv.path = 'fme/' + wv.path.split('\\').pop()
      data[1].forEach(function (p) {
        if (wv.id === p.workspace_version_id) {
          delete p.workspace_version_id;
          wv.parametros.push(p);
        }
      });
    });
  
    res.status(200).json(data[0])
  } catch (err) {
    return next(err)
  }
}

controller.getLastWorkspacesVersion = async (req, res, next) => {
  let data
  try {
    data = await db.task(t => {
      return t.batch([
        t.any('SELECT w.*, v.*, c.nome AS categoria FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY workspace ORDER BY data DESC) rn FROM fme.versao WHERE acessivel = TRUE) ' + 
        'AS v INNER JOIN fme.workspace AS w ON v.workspace_id = w.id INNER JOIN fme.categoria AS c ON c.id = w.categoria_id WHERE v.rn = 1'),
        t.any('SELECT workspace_version_id, nome, descricao, opcional, tipo, valores, valordefault FROM fme.parametro'),
      ]);
    })

    data[0].forEach(function (wv) {
      wv.parametros = [];
      wv.path = 'fme/' + wv.path.split('\\').pop()
      delete wv.rn;
      data[1].forEach(function (p) {
        if (wv.id === p.workspace_version_id) {
          delete p.workspace_version_id;
          wv.parametros.push(p);
        }
      });
    });
  
    res.status(200).json(data[0])
  } catch (err) {
    return next(err)
  }
}

controller.putVersion = async (req,res,next,body,id) => {
  try {
    await db.one('UPDATE fme.versao set acessivel =$1, autor = $2, versao = $3, data = $4 WHERE id = $5',
    [body.acessivel, body.autor, body.versao, body.data, id])
    res.status(200).json({message: "Versão atualizada com sucesso."})
  } catch (err) {
    if(err.message === 'No data returned from the query.'){
      return res.status(404).json({error: 'CategoriaNotFound'})
    } else {
      return next(err)
    }
  }
}

function updateJob(jobID, status, tempo, summary, parametros){
  if (!tempo) {
    tempo = null;
  }

  var paramtext = []
  for(var key in parametros){
    paramtext.push(key + ":" + parametros[key])
  }
  paramtext = paramtext.join(' | ')

  return db.none('UPDATE fme.job set status =$1, duracao = $2, log = $3, parametros = $4 WHERE jobid = $5',
          [status, tempo,  summary, paramtext, jobID])
}


const executeJob = async (jobid,version,parametros) => {
  try {
    await db.none('INSERT INTO fme.job(jobid, status, workspace_version_id, data) VALUES($1,$2,$3, CURRENT_TIMESTAMP)',
    [jobid, 1, version.id])
    let {tempo, summary} = await pythonRunner.runWorkspace(version.path, parametros)
    updateJob(jobid, 2, tempo, summary, parametros)
  } catch (err) {
    updateJob(jobid, 'Erro', null, [err], parametros)
  }
}

controller.createExecuteJob = async (req,res,next,body,id) => {
  let version
  try {
    version = await db.one('SELECT id, path FROM fme.versao WHERE id = $1', [id])
    const jobid = uuid()
    res.status(201).json({message: "Serviço de execução criado.", jobid})    
    executeJob(jobid,version,body.parametros)
  } catch (err) {
    if(err.message === 'No data returned from the query.'){
      return res.status(404).json({error: 'VersionNotFound'})
    } else {
      return next(err)
    }
  }
}



module.exports = controller