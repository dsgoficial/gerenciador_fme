BEGIN;

CREATE SCHEMA fme;

CREATE TABLE fme.category(
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR(255) NOT NULL UNIQUE --Categoria em que a tabela do FME pertence (por exemplo uma divisão por fase ou projeto)
);

CREATE TABLE fme.workspace(
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR(255) NOT NULL, --Nome da tabela do FME
	description TEXT NOT NULL, --Descrição do que a tabela do FME faz
	category_id SMALLINT NOT NULL REFERENCES fme.category(id) --Uma workspace pertence a uma categoria
);

CREATE TABLE fme.workspace_version(
	id SERIAL NOT NULL PRIMARY KEY,
	workspace_id SMALLINT NOT NULL REFERENCES fme.workspace(id),
	name VARCHAR(255), --Nome da versão
	version_date TIMESTAMP WITH TIME ZONE NOT NULL, --Data de upload da tabela, utilizada para definir versão atual
	author VARCHAR(255), --Autor da tabela para fins de metadados
	workspace_path TEXT NOT NULL, --Path onde será armazenada a tabela no servidor
	accessible BOOLEAN NOT NULL --Se a tabela está acessível para os usuários ou não
);

CREATE TABLE fme.parameters( --Os valores são extraídos do FME
	id SERIAL NOT NULL PRIMARY KEY,
	workspace_version_id SMALLINT NOT NULL REFERENCES fme.workspace_version(id), --Parâmetros de uma versão da tabela do FME
	name VARCHAR(255) NOT NULL,
	description VARCHAR(255),
	optional BOOLEAN,
	type VARCHAR(255),
	values VARCHAR(255),
	default_values VARCHAR(255)
);

CREATE TABLE fme.status(
	code SMALLINT NOT NULL PRIMARY KEY,
	name VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO fme.status (code, name) VALUES
(1, 'Running'),
(2, 'Succeeded'),
(3, 'Failed');

CREATE TABLE fme.job( --Execução de uma tabela do FME
	id SERIAL NOT NULL PRIMARY KEY,
	job_uuid TEXT NOT NULL UNIQUE,
	status SMALLINT NOT NULL REFERENCES fme.status(code),
	workspace_version_id SMALLINT NOT NULL REFERENCES fme.workspace_version(id),
	run_date TIMESTAMP WITH TIME ZONE NOT NULL,
	run_time REAL,
	log TEXT,
	parameters TEXT
);

GRANT USAGE ON SCHEMA fme TO fme_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA fme TO fme_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA fme TO fme_app;

COMMIT;