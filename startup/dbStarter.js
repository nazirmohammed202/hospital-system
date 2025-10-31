const mongoose = require("mongoose");
const { logger } = require("../config/winston");

// This function is responsible for connecting to the database
// It takes a callback function as an argument which will be called after the connection is established
// The callback ideally should contain the function to start the server after the connection is established, so that the server starts only after the database connection is established

module.exports.connectToDB = function (callback) {
  mongoose.set("strictQuery", false);

  mongoose
    .connect(process.env.DB_URI, {})
    .then(() => {
      logger.info("Connected to the database");
      if (callback) callback();
    })
    .catch((err) => logger.error(err.message));
};
