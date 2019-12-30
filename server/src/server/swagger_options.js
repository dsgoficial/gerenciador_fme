'use strict'

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Gerenciador do FME',
      version: '2.0.0',
      description: 'API HTTP para utilização do Gerenciador do FME'
    }
  },
  apis: ['./src/**/*.js']
}

module.exports = swaggerOptions
