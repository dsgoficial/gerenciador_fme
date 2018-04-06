"use strict";

const { db } = require("../database");
const { getParams } = require("./workspace_parse");

const controller = {};

controller.get = async () => {
  try {
    let data = await db.any(
      ```
      SELECT id, name, description, category_id FROM fme.workspace
      ```
    );
    return { error: null, data: data };
  } catch (error) {
    const err = new Error("Error getting all workspaces");
    err.status = 500;
    err.context = "workspaces_ctrl";
    err.information = { trace: error };
    return { error: err, data: null };
  }
};

controller.update = async (id, name, description, categoryId) => {
  try {
    let result = await db.result(
      ```
      UPDATE fme.workspace SET name =$1, description =$2, category_id =$3 WHERE id = $4
      ```,
      [name, description, categoryId, id]
    );
    if (!result.rowCount || result.rowCount < 1) {
      let error = new Error("Workspace not found.");
      error.status = 404;
      error.context = "workspaces_ctrl";
      error.information = { id, name, description, categoryId };
      throw error;
    }
    return { error: null };
  } catch (error) {
    if (error.message === "Workspace not found.") {
      return { error: error };
    } else {
      const err = new Error("Error updating workspace");
      err.status = 500;
      err.context = "workspaces_ctrl";
      error.information = { id, name, description, categoryId, trace: error };
      return { error: err };
    }
  }
};

controller.saveWorkspace = async (
  workspacePath,
  versionName,
  versionDate,
  versionAuthor,
  name,
  description,
  categoryId,
  workspaceId
) => {
  try {
    let params = await getParams(workspacePath);

    await db.tx(async t => {
      if (!workspaceId) {
        let workspace = await t.one(
          ```
          INSERT INTO fme.workspace(name, description, category_id) VALUES($1,$2,$3) RETURNING id
          ```,
          [name, description, categoryId]
        );
        const workspaceId = workspace.id;
      }

      let versionDate = new Date(versionDate).toISOString();

      let version = await t.one(
        ```
        INSERT INTO fme.workspace_version(workspace_id, name, version_date, author, workspace_path, accessible)
        VALUES($1,$2,$3,$4,$5,TRUE) RETURNING id
        ```,
        [workspaceId, versionName, versionDate, versionAuthor, workspacePath]
      );

      let queries = [];
      params.forEach(p => {
        queries.push(
          t.none(
            ```
            INSERT INTO fme.parameters(workspace_version_id, name)
            VALUES($1, $2)
            ```,
            [version.id, p]
          )
        );
      });
      return await t.batch(queries);
    });
    return { error: null };
  } catch (error) {
    const err = new Error("Error creating new workspace");
    err.status = 500;
    err.context = "workspaces_ctrl";
    err.information = {
      workspacePath,
      versionName,
      versionDate,
      versionAuthor,
      name,
      description,
      categoryId,
      workspaceId,
      trace: error
    };
    return { error: err };
  }
};

module.exports = controller;
