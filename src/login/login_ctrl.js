"use strict";

const jwt = require("jsonwebtoken");

const { db } = require("../database");

const bcrypt = require("bcryptjs");

const controller = {};

controller.login = async (login, password) => {
  try {
    let user = await db.oneOrNone(
      `
    SELECT id, password FROM fme.user WHERE login = $1
    `,
      [login]
    );
    if (user) {
      const match = await bcrypt.compare(user.password, password);
      if (match) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "10h"
        });
        return { error: null, token };
      }
    }
    const err = new Error("User or password incorrect");
    err.status = 401;
    err.context = "login_ctrl";
    err.information = { login };
    return { error: err, token: null };
  } catch (error) {
    const err = new Error("Error in the login");
    err.status = 500;
    err.context = "login_ctrl";
    err.information = { login, trace: error };
    return { error: err, token: null };
  }
};

controller.createUser = async (name, login, password) => {
  try {
    let hash = await bcrypt.hash(password, 10);

    await db.any(
      `
      INSERT INTO fme.user(name, login, password) VALUES($1,$2,$3)
      `,
      [name, login, hash]
    );

    return { error: null };
  } catch (error) {
    const err = new Error("Error creating user");
    err.status = 500;
    err.context = "login_ctrl";
    err.information = { name, login, trace: error };
    return { error: err };
  }
};

controller.updateUser = async (id, name, login) => {
  try {
    let result = await db.result(
      `
      UPDATE fme.user SET name =$1, login=$2 WHERE id = $3
      `,
      [name, login, id]
    );
    if (!result.rowCount || result.rowCount < 1) {
      throw new Error("User not found.");
    }
    return { error: null };
  } catch (error) {
    if (error.message === "User not found.") {
      error.status = 404;
      error.context = "login_ctrl";
      error.information = { id, name, login };
      return { error: error };
    } else {
      const err = new Error("Error updating user");
      err.status = 500;
      err.context = "login_ctrl";
      err.information = { id, name, login, trace: error };
      return { error: err };
    }
  }
};

controller.updatePassword = async (id, oldpassword, newpassword) => {
  try {
    let user = await db.oneOrNone(
      `
    SELECT password FROM fme.user WHERE id = $1
    `,
      [id]
    );
    if (user) {
      const match = await bcrypt.compare(user.password, password);
      if (match) {
        let hashNew = await bcrypt.hash(newpassword, 10);

        let result = await db.result(
          `
          UPDATE fme.user SET password =$1 WHERE id = $2
          `,
          [hashNew, id]
        );
        if (!result.rowCount || result.rowCount < 1) {
          throw new Error("User not found.");
        }
        return { error: null };
      }
    }
    throw new Error("User not found.");
  } catch (error) {
    if (error.message === "User not found.") {
      error.status = 404;
      error.context = "login_ctrl";
      error.information = { id };
      return { error: error };
    } else {
      const err = new Error("Error updating user password");
      err.status = 500;
      err.context = "login_ctrl";
      err.information = { id, trace: error };
      return { error: err };
    }
  }
};

module.exports = controller;
