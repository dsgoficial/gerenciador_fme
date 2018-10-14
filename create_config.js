"use strict";

const fs = require("fs");
const inquirer = require("inquirer");
const chalk = require("chalk");
const pgtools = require("pgtools");
const path = require("path");
const bcrypt = require("bcryptjs");
const promise = require("bluebird");

const initOptions = {
  promiseLib: promise
};

const pgp = require("pg-promise")(initOptions);

const fmeManagerSQL = fs
  .readFileSync(path.resolve("./er/fme_manager.sql"), "utf-8")
  .trim();

const createConfig = () => {
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
        "Enter the user name for database administration (should already exist in PostgreSQL and have database creation privilege)",
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
      default: "fme_manager"
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
      message: "Enter the secret for the JSON Web Token"
    },
    {
      type: "input",
      name: "fme_user",
      message: "Enter the user name for FME Manager administration",
      default: "administrator"
    },
    {
      type: "password",
      name: "fme_password",
      message: "Enter the password for the FME Manager administration user"
    },
    {
      type: "input",
      name: "fme_path",
      message: "Enter the path for fme execution"
    }
  ];

  inquirer.prompt(questions).then(async answers => {
    const config = {
      user: answers.db_user,
      password: answers.db_password,
      port: answers.db_port,
      host: answers.db_server
    };

    try {
      await pgtools.createdb(config, answers.db_name);

      const connectionString =
        "postgres://" +
        answers.db_user +
        ":" +
        answers.db_password +
        "@" +
        answers.db_server +
        ":" +
        answers.db_port +
        "/" +
        answers.db_name;

      const db = pgp(connectionString);

      await db.none(fmeManagerSQL);

      await db.none(
        `
      GRANT USAGE ON SCHEMA fme TO $1:name;
      GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA fme TO $1:name;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA fme TO $1:name;
      `,
        [answers.db_user]
      );

      let hash = await bcrypt.hash(answers.db_password, 10);
      await db.none(
        `
        INSERT INTO fme.user (name, login, password) VALUES
        ($1, $1, $2)
      `,
        [answers.fme_user, hash]
      );

      console.log(chalk.blue("FME Manager database created successfully!"));

      let env = `PORT=${answers.port}
DB_SERVER=${answers.db_server}
DB_PORT=${answers.db_port}
DB_NAME=${answers.db_name}
DB_USER=${answers.db_user}
DB_PASSWORD=${answers.db_password}
JWT_SECRET=${answers.jwt_secret}
PATH=${answers.fme_path}`;

      fs.writeFileSync(".env", env);
      console.log(chalk.blue("Config file created successfully!"));
    } catch (error) {
      if (
        error.message ===
        "Postgres error. Cause: permission denied to create database"
      ) {
        console.log(
          chalk.red(
            "The user passed does not have permission to create databases."
          )
        );
      } else if (
        error.message ===
        'Attempted to create a duplicate database. Cause: database "' +
          answers.db_name +
          '" already exists'
      ) {
        console.log(
          chalk.red("The database " + answers.db_name + " already exists.")
        );
      } else if (
        error.message ===
        'password authentication failed for user "' + answers.db_user + '"'
      ) {
        console.log(
          chalk.red(
            "Password authentication failed for the user " + answers.db_user
          )
        );
      } else {
        console.log(error.message);
        console.log("-------------------------------------------------");
        console.log(error);
      }
    }
  });
};

createConfig();
