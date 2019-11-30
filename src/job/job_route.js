"use strict";

const express = require("express");

const { schemaValidation, asyncHandler, httpCode } = require("../utils");

const { verifyAdmin } = require("../login");

const jobCtrl = require("./job_ctrl");
const jobSchema = require("./job_schema");

const router = express.Router();

router.get(
  "/",
  verifyAdmin,
  asyncHandler(async (req, res, next) => {
    const dados = await jobCtrl.get();

    const msg = "Jobs retornados";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

router.get(
  "/:uuid",
  verifyAdmin,
  schemaValidation({ params: jobSchema.uuidParams }),
  asyncHandler(async (req, res, next) => {
    const dados = await jobCtrl.getJobStatus(req.params.uuid);

    const msg = "Informação sobre o job retornada";

    return res.sendJsonAndLog(true, msg, httpCode.OK, dados);
  })
);

module.exports = router;
