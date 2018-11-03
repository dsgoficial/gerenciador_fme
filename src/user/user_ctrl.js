"use strict";

const { db } = require("../database");

const controller = {};

controller.get = async () => {
  try {
    let data = await db.any(
      `
    SELECT id, name FROM fme.user
    `
    );
    return { error: null, data: data };
  } catch (error) {
    const err = new Error("Error getting all users");
    err.status = 500;
    err.context = "user_ctrl";
    err.information = { trace: error };
    return { error: err, data: null };
  }
};

module.exports = controller;
