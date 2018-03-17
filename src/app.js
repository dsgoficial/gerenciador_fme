const express = require('express')
const path = require('path')

const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')

const categoriasRoute = require('./routes/categorias_route')
const jobsRoute = require('./routes/jobs_route')
const workspacesRoute = require('./routes/workspaces_route')
const versionsRoute = require('./routes/versions_route')

const app = express()
app.disable('x-powered-by')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//CORS middleware
app.use(cors({
  exposedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Link','Location']
}))

//Helmet Protection
app.use(helmet())
app.use(helmet.noCache()) //Disables cache

//Lower case query parameters
app.use((req, res, next) => {
  for (var key in req.query) {
    req.query[key.toLowerCase()] = req.query[key]
  }
  next()
})

//informa que o serviço de dados do Gerenciador do FME está operacional
app.get('/', (req, res, next) => {
  res.status(200).json({
    message: "Serviço Gerenciador do FME operacional"
  })
})

//Serve static files (baixar tabelas do FME carregadas)
app.use('/fme', express.static(path.join(__dirname, 'fme_workspaces')))
//Serve APIDoc
app.use('/docs', express.static(path.join(__dirname, 'apidoc')));
//Serve HTTP Client
app.use('/client', express.static(path.join(__dirname, 'http_client')));


//Routes
app.use('/categorias', categoriasRoute)
app.use('/jobs', jobsRoute)
app.use('/workspaces', workspacesRoute)
app.use('/versions', versionsRoute)

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  err.message = "URL não encontrada."
  next(err)
})

// Error handler
app.use((err, req, res, next) => {
  console.log(err.message) //Remover se não estiver debugando
  res.status(err.status || 500).json({
    message: "Error",
    error: err.message,
  })
})

module.exports = app