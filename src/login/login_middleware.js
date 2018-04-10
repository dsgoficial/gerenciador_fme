"use strict";

const jwt = require("jsonwebtoken");

const { sendJsonAndLog } = require("../logger");

//middleware para verificar o JWT
const verifyToken = function(req, res, next) {
  //verifica o header authorization para pegar o token
  const token = req.headers["x-access-token"] || req.headers["authorization"];
  //decode token
  if (token) {
    //verifica se o token é valido
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        return sendJsonAndLog(
          false,
          "Failed to authenticate token",
          "login_middleware",
          {
            url: req.protocol + "://" + req.get("host") + req.originalUrl,
            token: token
          },
          res,
          401,
          null
        );
      } else {
        // se tudo estiver ok segue para a próxima rota com o atributo id
        req.body.user_id = decoded.id;
        next();
      }
    });
  } else {
    return sendJsonAndLog(
      false,
      "No token provided",
      "login_middleware",
      {
        url: req.protocol + "://" + req.get("host") + req.originalUrl
      },
      res,
      403,
      null
    );
  }
};

module.exports = verifyToken;
