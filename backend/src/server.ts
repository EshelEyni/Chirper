const { logger } = require("./services/logger.service");

process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught exception:", err.name, err.message);
  process.exit(1);
});

const app = require("./app");
const config = require("./config");

import mongoose from "mongoose";

const DB = config.dbURL;

mongoose
  .connect(DB, {
    dbName: "chirper_db",
  })
  .then(() => {
    logger.info("Connected to MongoDB.");
  })
  .catch(error => {
    logger.error("Failed to connect to MongoDB:", error);
  });

const port = process.env.PORT || 3030;

const server = app.listen(port, () => {
  logger.info(`Server is running on port: ${port}`);
});

process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled rejection:", err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
