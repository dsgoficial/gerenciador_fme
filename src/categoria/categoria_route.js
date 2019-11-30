"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const { verifyAdmin } = require("../login");

const categoriaCtrl = require("./categoria_ctrl");
const categoriaSchema = require("./categoryia_schema");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const dados = await categoriaCtrl.get();

    const msg = "Categorias retornadas";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.post(
  "/",
  verifyAdmin,
  schemaValidation({ body: categoriaSchema.category }),
  asyncHandler(async (req, res, next) => {
    await categoriaCtrl.create(req.body.name);

    const msg = "Categoria criada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.Created);
  })
);

router.put(
  "/:id",
  verifyAdmin,
  schemaValidation({
    body: categoriaSchema.category,
    params: categoriaSchema.idParams
  }),
  asyncHandler(async (req, res, next) => {
    await categoriaCtrl.update(req.params.id, req.body.name);

    const msg = "Categoria atualizada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

router.delete(
  "/:id",
  verifyAdmin,
  schemaValidation({
    params: categoriaSchema.idParams
  }),
  asyncHandler(async (req, res, next) => {
    await categoriaCtrl.delete(req.params.id);

    const msg = "Categoria deletada com sucesso";

    return res.sendJsonAndLog(true, msg, httpCode.OK);
  })
);

module.exports = router;
