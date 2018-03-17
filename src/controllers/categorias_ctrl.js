const db = require('../utils/database_connection')
const controller = {}

controller.get = async (req,res,next) => {
  let data
  try {
    data = await db.any('SELECT id, nome from fme.categoria')
    res.status(200).json(data)
  } catch (err) {
    return next(err)
  }
}

controller.post = async (req,res,next,body) => {
  try {
    await db.any('INSERT INTO fme.categoria(nome) VALUES($1)', [body.nome])
    res.status(201).json({message: "Categoria inserida com sucesso."})
  } catch (err) {
    console.log(err)
    return next(err)
  }
}

controller.put = async (req,res,next,body,id) => {
  try {
    await db.any('UPDATE fme.categoria set nome =$1 WHERE id = $2', [body.nome, id])
    res.status(201).json({message: "Categoria atualizada com sucesso."})
  } catch (err) {
    if(err.message === 'No data returned from the query.'){
      return res.status(404).json({error: 'CategoriaNotFound'})
    } else {
      return next(err)
    }
  }
}

module.exports = controller