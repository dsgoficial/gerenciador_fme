"use strict";

const fs = require("fs");
const inquirer = require("inquirer");
const chalk = require("chalk");

const createConfig = async () => {
  console.log(chalk.blue("FME Manager REST API"));
  console.log(chalk.blue("Create config file"));

  var questions = [
    {
      type: "input",
      name: "db_server",
      message: "Enter the IP Address for the PostgreSQL database"
    },
    {
      type: "input",
      name: "db_port",
      message: "Enter the port for the PostgreSQL database",
      default: 5432
    },
    {
      type: "input",
      name: "db_user",
      message:
        "Enter the user name for database administration (should already exist)",
      default: "fme_app"
    },
    {
      type: "password",
      name: "db_password",
      message: "Enter the password for the administration user"
    },
    {
      type: "input",
      name: "db_name",
      message: "Enter the database name for the FME Manager",
      default: "sap"
    },
    {
      type: "confirm",
      name: "databaseCreation",
      message: "Deseja criar o banco de dados do SAP?",
      default: false
    },
    {
      type: "input",
      name: "port",
      message: "Enter the port for the FME Manager service",
      default: 3014
    },
    {
      type: "password",
      name: "jwt_secret",
      message: "Enter the secret for the JWT generation"
    }
  ];

  await inquirer
    .prompt(questions)
    .then(answers => {
      if (answers.databaseCreation) {
        //TODO criação do banco de dados
      }

      let env = `PORT=${answers.port}
DB_SERVER=${answers.db_server}
DB_PORT=${answers.db_port}
DB_NAME=${answers.db_name}
DB_USER=${answers.db_user}
DB_PASSWORD=${answers.db_password}
JWT_SECRET=${answers.jwt_secret}`;

      fs.writeFileSync(".env", env);
      console.log(chalk.blue("Config file created successfully!"));
    })
    .catch(err => console.log(err));
};

createConfig();
