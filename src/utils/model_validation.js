const joi_middleware = require('express-joi-validation')({});

const categoriasSchema = require('../models/categorias_model')
const versionsSchema = require('../models/versions_model')
const jobsSchema = require('../models/jobs_model')
const workspacesSchema = require('../models/workspaces_model')

const validator = {}

validator.categorias = joi_middleware.body(categoriasSchema)
validator.versions = joi_middleware.body(versionsSchema)
validator.jobs = joi_middleware.body(jobsSchema)
validator.workspaces = joi_middleware.body(workspacesSchema)


module.exports = validator
