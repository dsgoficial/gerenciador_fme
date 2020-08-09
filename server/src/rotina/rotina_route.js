"use strict";

const express = require("express");

const { v4: uuidv4 } = require("uuid");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const { verifyLogin } = require("../login");

const rotinaCtrl = require("./rotina_ctrl");
const rotinaSchema = require("./rotina_schema");
const rotinaUpload = require("./rotina_upload");

const router = express.Router();

router.delete(
  "/versoes/:id",
  schemaValidation({
    params: rotinaSchema.idParams,
  }),
  verifyLogin,
  asyncHandler(async (req, res, next) => {
    const dados = await rotinaCtrl.deletarVersao(req.params.id);

    const msg = "Versão deletada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/versoes",
  asyncHandler(async (req, res, next) => {
    const dados = await rotinaCtrl.getVersoes();

    const msg = "Versões retornadas com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/:id/versao",
  verifyLogin,
  rotinaUpload,
  schemaValidation({
    params: rotinaSchema.idParams,
  }),
  asyncHandler(async (req, res, next) => {
    await rotinaCtrl.criaVersao(req.params.id, req.file.path, req.usuarioUuid);

    const msg = "Nova versão da rotina criada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.post(
  "/:id/execucao",
  schemaValidation({
    params: rotinaSchema.idParams,
    body: rotinaSchema.rotinaParametros,
  }),
  asyncHandler(async (req, res, next) => {
    const jobUuid = uuidv4();

    await rotinaCtrl.execucaoRotina(
      req.params.id,
      jobUuid,
      req.body.parametros
    );

    const msg = "Execução da rotina requisitada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created, {
      job_uuid: jobUuid,
    });
  })
);

router.put(
  "/:id",
  verifyLogin,
  schemaValidation({
    params: rotinaSchema.idParams,
    body: rotinaSchema.rotina,
  }),
  asyncHandler(async (req, res, next) => {
    await rotinaCtrl.atualizaRotina(
      req.params.id,
      req.body.nome,
      req.body.descricao,
      req.body.categoria_id,
      req.body.ativa
    );

    const msg = "Rotina atualizada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.delete(
  "/:id",
  verifyLogin,
  schemaValidation({
    params: rotinaSchema.idParams,
  }),
  asyncHandler(async (req, res, next) => {
    await rotinaCtrl.deletaRotina(req.params.id);

    const msg = "Rotina deletada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.get(
  "/completo",
  verifyLogin,
  asyncHandler(async (req, res, next) => {
    const dados = await rotinaCtrl.getRotinasCompleto();

    const msg = "Rotinas retornadas";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/",
  schemaValidation({
    query: rotinaSchema.rotinaQuery,
  }),
  asyncHandler(async (req, res, next) => {
    const dados = await rotinaCtrl.getRotinas(
      req.query.ids,
      req.query.categoria
    );

    const msg = "Rotinas retornadas";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/",
  verifyLogin,
  rotinaUpload,
  schemaValidation({
    body: rotinaSchema.versaoRotina,
  }),
  asyncHandler(async (req, res, next) => {
    await rotinaCtrl.criaRotina(
      req.file.path,
      req.usuarioUuid,
      req.body.nome,
      req.body.descricao,
      req.body.categoria_id
    );

    const msg = "Rotina criada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

module.exports = router;
