//Basic Express Middleware configuration

const express = require("express");
const cors = require("cors");
const { logger } = require("../config/winston");
const jwt = require("jsonwebtoken");

module.exports.enableMiddlewares = function (app) {
  app.use(cors());
  app.use(express.json());
  //all middleware routes will be added here

  app.use("/api/signup", require("../routes/user/create"));
  app.use("/api/login", require("../routes/user/login"));
  app.use("/api/read/users/", require("../routes/user/read"));
  app.use("/api/update/users/", require("../routes/user/update"));
  app.use("/api/note/create", require("../routes/notes/create"));
  app.use("/api/note/read", require("../routes/notes/read"));
  app.use("/api/reminders/read", require("../routes/reminders/read"));
  app.use("/api/reminders/update", require("../routes/reminders/update"));

  app.use((req, res) =>
    res.status(404).send("The requested resource was not found")
  );
  return app;
};

module.exports.routeHandler = function (handler) {
  //This function is a wrapper for route handlers to catch any errors that occur in the handler
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      logger.error(error.message, error);
      res.status(500).send({ message: "An error occurred" });
    }
  };
};

module.exports.auth = function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");
  try {
    const decoded = jwt.verify(token, process.env.UNIQUE_PRIVATE_KEY);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token");
    next(ex);
  }
};
