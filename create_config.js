"use strict";

const fs = require("fs");
const inquirer = require("inquirer");
const colors = require("colors"); //colors for console
const pgtools = require("pgtools");
const path = require("path");
const promise = require("bluebird");
const crypto = require("crypto");
const axios = require("axios");

const pgp = require("pg-promise")({
  promiseLib: promise
});

const readSqlFile = file => {
  const fullPath = path.join(__dirname, file);
  return new pgp.QueryFile(fullPath, { minify: true });
};

const verifyDotEnv = () => {
  return fs.existsSync("config.env");
};

const verifyAuthServer = async authServer => {
  if (!authServer.startsWith("http://") && !authServer.startsWith("https://")) {
    throw new Error("Servidor deve iniciar com http:// ou https://");
  }
  try {
    const response = await axios.get(authServer);
    const wrongServer =
      !response ||
      response.status !== 200 ||
      !("data" in response) ||
      response.data.message !== "Serviço de autenticação operacional";

    if (wrongServer) {
      throw new Error();
    }
  } catch (e) {
    throw new Error("Erro ao se comunicar com o servidor de autenticação");
  }
};

const verifyLoginAuthServer = async (servidor, usuario, senha) => {
  const server = servidor.endsWith("/")
    ? `${servidor}login`
    : `${servidor}/login`;
  try {
    const response = await axios.post(server, {
      usuario,
      senha
    });

    if (!response || response.status !== 201 || !("data" in response)) {
      throw new Error();
    }

    return response.data.success || false;
  } catch (e) {
    throw new AppError(
      "Erro ao se comunicar com o servidor de autenticação",
      http_code.InternalError
    );
  }
};

const createDotEnv = (
  port,
  dbServer,
  dbPort,
  dbName,
  dbUser,
  dbPassword,
  authServer,
  fmePath
) => {
  const secret = crypto.randomBytes(64).toString("hex");

  const env = `PORT=${port}
DB_SERVER=${dbServer}
DB_PORT=${dbPort}
DB_NAME=${dbName}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
JWT_SECRET=${secret}
AUTH_SERVER=${authServer}
fmePath=${fmePath}`;

  fs.writeFileSync("config.env", env);
};

const givePermission = async ({
  dbUser,
  dbPassword,
  dbPort,
  dbServer,
  dbName,
  connection
}) => {
  if (!connection) {
    const connectionString = `postgres://${dbUser}:${dbPassword}@${dbServer}:${dbPort}/${dbName}`;

    connection = pgp(connectionString);
  }
  await connection.none(readSqlFile("./er/permissao.sql"), [dbUser]);
};

const insertAdminUser = async (nome, connection) => {
  await connection.none(
    `INSERT INTO fme.user (name, administrator, active) VALUES
    ($<nome>, TRUE, TRUE)`,
    { nome }
  );
};

const createDatabase = async (
  dbUser,
  dbPassword,
  dbPort,
  dbServer,
  dbName,
  authUser
) => {
  const config = {
    user: dbUser,
    password: dbPassword,
    port: dbPort,
    host: dbServer
  };

  await pgtools.createdb(config, dbName);

  const connectionString = `postgres://${dbUser}:${dbPassword}@${dbServer}:${dbPort}/${dbName}`;

  const db = pgp(connectionString);
  await db.tx(async t => {
    await t.none(readSqlFile("./er/versao.sql"));
    await t.none(readSqlFile("./er/gerenciador_fme.sql"));
    await givePermission({ dbUser, connection: t });
    await insertAdminUser(authUser, t);
  });
};

const handleError = error => {
  if (
    error.message ===
    "Postgres error. Cause: permission denied to create database"
  ) {
    console.log(
      "O usuário informado não é superusuário. Sem permissão para criar bancos de dados."
        .red
    );
  } else if (
    error.message === 'permission denied to create extension "postgis"'
  ) {
    console.log(
      "O usuário informado não é superusuário. Sem permissão para criar a extensão 'postgis'. Delete o banco de dados criado antes de executar a configuração novamente."
        .red
    );
  } else if (
    error.message.startsWith("Attempted to create a duplicate database")
  ) {
    console.log(`O banco já existe.`.red);
  } else if (
    error.message.startsWith("password authentication failed for user")
  ) {
    console.log(`Senha inválida para o usuário`.red);
  } else {
    console.log(error.message.red);
    console.log("-------------------------------------------------");
    console.log(error);
  }
  process.exit(0);
};

const createConfig = async () => {
  try {
    console.log("Gerenciador do FME API Rest".blue);
    console.log("Criação do arquivo de configuração".blue);

    const exists = verifyDotEnv();
    if (exists) {
      throw new Error(
        "Arquivo config.env já existe, apague antes de iniciar a configuração."
      );
    }

    const questions = [
      {
        type: "input",
        name: "dbServer",
        message:
          "Qual o endereço de IP do servidor do banco de dados PostgreSQL?"
      },
      {
        type: "input",
        name: "dbPort",
        message: "Qual a porta do servidor do banco de dados PostgreSQL?",
        default: 5432
      },
      {
        type: "input",
        name: "dbUser",
        message:
          "Qual o nome do usuário do PostgreSQL para interação com o Gerenciador do FME (já existente no banco de dados e ser superusuario)?",
        default: "controle_app"
      },
      {
        type: "password",
        name: "dbPassword",
        mask: "*",
        message:
          "Qual a senha do usuário do PostgreSQL para interação com o Gerenciador do FME?"
      },
      {
        type: "input",
        name: "dbName",
        message: "Qual o nome do banco de dados do Gerenciador do FME?",
        default: "gerenciador_fme"
      },
      {
        type: "input",
        name: "port",
        message: "Qual a porta do serviço do Gerenciador do FME?",
        default: 3014
      },
      {
        type: "confirm",
        name: "dbCreate",
        message: "Deseja criar o banco de dados do Gerenciador do FME?",
        default: true
      },
      {
        type: "input",
        name: "fmePath",
        message: "Entre com o PATH para execução do FME Workbench",
        default: "fme"
      },
      {
        type: "input",
        name: "authServer",
        message:
          "Qual a URL do serviço de autenticação (iniciar com http:// ou https://)?"
      },
      {
        type: "input",
        name: "authUser",
        message:
          "Qual o nome do usuário já existente Serviço de Autenticação que será administrador do SAP?"
      },
      {
        type: "password",
        name: "authPassword",
        mask: "*",
        message:
          "Qual a senha do usuário já existente Serviço de Autenticação que será administrador do SAP?"
      }
    ];

    const {
      port,
      dbServer,
      dbPort,
      dbName,
      dbUser,
      dbPassword,
      dbCreate,
      fmePath,
      authServer,
      authUser,
      authPassword
    } = await inquirer.prompt(questions);

    await verifyAuthServer(authServer);

    const authenticated = await verifyLoginAuthServer(
      authServer,
      authUser,
      authPassword
    );
    if (!authenticated) {
      throw new Error("Usuário ou senha inválida no Serviço de Autenticação.");
    }

    if (dbCreate) {
      await createDatabase(
        dbUser,
        dbPassword,
        dbPort,
        dbServer,
        dbName,
        authUser
      );

      console.log(
        "Banco de dados do Gerenciador do FME criado com sucesso!".blue
      );
    } else {
      await givePermission({ dbUser, dbPassword, dbPort, dbServer, dbName });

      console.log(`Permissão ao usuário ${dbUser} adicionada com sucesso`.blue);
    }

    createDotEnv(
      port,
      dbServer,
      dbPort,
      dbName,
      dbUser,
      dbPassword,
      authServer,
      fmePath
    );

    console.log(
      "Arquivo de configuração (config.env) criado com sucesso!".blue
    );

    require("./create_documentation");
  } catch (e) {
    handleError(e);
  }
};

createConfig();
