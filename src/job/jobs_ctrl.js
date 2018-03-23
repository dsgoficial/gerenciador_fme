const db = require('../utils/database_connection')

const controller = {}

controller.get = async (req,res,next) => {
  let data
  try {
    data = await db.any('SELECT j.jobid, j.status, j.data, j.duracao, j.log, j.parametros, w.nome as workspace, v.versao' +
    ' FROM fme.job as j INNER JOIN fme.versao AS v ON  j.workspace_version_id = v.id' + 
    ' INNER JOIN fme.workspace AS w ON w.id = v.workspace_id')
    res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
}

controller.getJobStatus = async (req,res,next,id) => {
  let data
  try {
    data = await db.one('SELECT j.jobid, j.status, j.data, j.duracao, j.log, j.parametros,  w.nome as workspace, v.versao FROM fme.job as j ' + 
    ' INNER JOIN fme.versao AS v ON j.workspace_version_id = v.id INNER JOIN fme.workspace AS w ON w.id = v.workspace_id WHERE j.jobid = $1', [id])
    res.status(200).json(data)
  } catch (err) {
    if(err.message === 'No data returned from the query.'){
      return res.status(404).json({error: 'JobNotFound'})
    } else {
      return next(err)
    }
  }
}

module.exports = controller