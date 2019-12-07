
CREATE SCHEMA fme;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE fme.user(
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
  administrator BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
	uuid UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4()
);

CREATE TABLE fme.category(
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE fme.workspace(
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	category_id SMALLINT NOT NULL REFERENCES fme.category(id)
);

CREATE TABLE fme.workspace_version(
	id SERIAL NOT NULL PRIMARY KEY,
	workspace_id SMALLINT NOT NULL REFERENCES fme.workspace(id),
	name VARCHAR(255),
	version_date TIMESTAMP WITH TIME ZONE NOT NULL,
	author SMALLINT NOT NULL REFERENCES fme.user(id),
	workspace_path TEXT NOT NULL,
	accessible BOOLEAN NOT NULL
);

CREATE TABLE fme.parameters(
	id SERIAL NOT NULL PRIMARY KEY,
	workspace_version_id SMALLINT NOT NULL REFERENCES fme.workspace_version(id),
	name VARCHAR(255) NOT NULL
);

CREATE TABLE fme.status(
	code SMALLINT NOT NULL PRIMARY KEY,
	name VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO fme.status (code, name) VALUES
(1, 'Running'),
(2, 'Succeeded'),
(3, 'Failed');

CREATE TABLE fme.job(
	id SERIAL NOT NULL PRIMARY KEY,
	job_uuid TEXT NOT NULL UNIQUE,
	status SMALLINT NOT NULL REFERENCES fme.status(code),
	workspace_version_id SMALLINT NOT NULL REFERENCES fme.workspace_version(id),
	run_date TIMESTAMP WITH TIME ZONE NOT NULL,
	run_time REAL,
	log TEXT,
	parameters TEXT
);