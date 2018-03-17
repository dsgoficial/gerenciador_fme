--Deve ser executado dentro do banco gerenciador_fme

BEGIN;
--Usuário que será utilizado pela API. Substituir senha conforme necessidade.
CREATE USER fme_app WITH PASSWORD 'fme_app';

CREATE SCHEMA fme;

CREATE TABLE fme.categoria(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE --Categoria em que a tabela do FME pertence (por exemplo uma divisão por fase ou projeto)
);

CREATE TABLE fme.workspace(
	id SERIAL NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL, --Nome da tabela do FME
	descricao TEXT NOT NULL, --Descrição do que a tabela do FME faz
	categoria_id SMALLINT NOT NULL REFERENCES fme.categoria(id) --Uma workspace pertence a uma categoria
);

CREATE TABLE fme.versao(
	id SERIAL NOT NULL PRIMARY KEY,
	workspace_id SMALLINT NOT NULL REFERENCES fme.workspace(id),
	versao VARCHAR(255), --Nome da versão
	data TIMESTAMP WITH TIME ZONE NOT NULL, --Data de upload da tabela, utilizada para definir versão atual
	autor VARCHAR(255), --Autor da tabela para fins de metadados
	path TEXT NOT NULL, --Path onde será armazenada a tabela no servidor
	acessivel BOOLEAN NOT NULL --Se a tabela está acessível para os usuários ou não
);

CREATE TABLE fme.parametro( --Os valores são extraídos do FME
	id SERIAL NOT NULL PRIMARY KEY,
	workspace_version_id SMALLINT NOT NULL REFERENCES fme.versao(id), --Parâmetros de uma versão da tabela do FME
	nome VARCHAR(255) NOT NULL,
	descricao VARCHAR(255),
	opcional BOOLEAN,
	tipo VARCHAR(255),
	valores VARCHAR(255),
	valordefault VARCHAR(255)
);

CREATE TABLE fme.status(
	id SMALLINT NOT NULL PRIMARY KEY,
	nome VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO fme.status (id,nome) VALUES
(1, 'Recebido'),
(2, 'Executado'),
(3, 'Erro');

CREATE TABLE fme.job( --Execução de uma tabela do FME
	id SERIAL NOT NULL PRIMARY KEY,
	jobid TEXT NOT NULL UNIQUE,
	status_id SMALLINT NOT NULL REFERENCES fme.status(id),
	workspace_version_id SMALLINT NOT NULL REFERENCES fme.versao(id),
	data TIMESTAMP WITH TIME ZONE NOT NULL,
	duracao REAL,
	log TEXT,
	parametros TEXT
);

GRANT USAGE ON SCHEMA fme TO fme_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA fme TO fme_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA fme TO fme_app;

COMMIT;