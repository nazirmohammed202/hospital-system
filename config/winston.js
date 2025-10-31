const winston = require("winston");

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

logger.add(new winston.transports.Console({ format: winston.format.simple() }));

module.exports.logger = logger;
