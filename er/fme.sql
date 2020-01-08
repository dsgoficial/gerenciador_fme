BEGIN;

CREATE SCHEMA fme;

CREATE TABLE fme.categoria(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE,
	descricao TEXT
);

CREATE TABLE fme.rotina(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) UNIQUE NOT NULL,
	descricao TEXT NOT NULL,
	categoria_id SMALLINT NOT NULL REFERENCES fme.categoria(id),
	ativa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE fme.versao_rotina(
	id SERIAL NOT NULL PRIMARY KEY,
	rotina_id SMALLINT NOT NULL REFERENCES fme.rotina(id),
	nome INTEGER NOT NULL,
	data TIMESTAMP WITH TIME ZONE NOT NULL,
	usuario_id SMALLINT REFERENCES dgeo.usuario(id),
	path TEXT NOT NULL
);

CREATE TABLE fme.parametros(
	id SERIAL NOT NULL PRIMARY KEY,
	versao_rotina_id SMALLINT NOT NULL REFERENCES fme.versao_rotina(id),
	nome VARCHAR(255) NOT NULL
);

CREATE TABLE fme.execucao(
	id SERIAL NOT NULL PRIMARY KEY,
	uuid UUID NOT NULL UNIQUE,
	status_id SMALLINT NOT NULL REFERENCES dominio.status(code),
	versao_rotina_id SMALLINT REFERENCES fme.versao_rotina(id),
	rotina_id SMALLINT REFERENCES fme.rotina(id),
	data_execucao TIMESTAMP WITH TIME ZONE NOT NULL,
	tempo_execucao REAL,
	log json,
	parametros json
);

COMMIT;