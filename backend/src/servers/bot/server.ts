import { logger } from "../../services/logger/logger.service";

process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught exception:", err.name, err.message);
  process.exit(1);
});

require("dotenv").config();
import mongoose from "mongoose";
import app from "./app";
import { AppError } from "../../services/error/error.service";

const { DB_URL } = process.env;
if (!DB_URL) throw new AppError("DB_URL URL is not defined.", 500);

const dbName =
  process.env.NODE_ENV === "production" ? process.env.PROD_DB_NAME : process.env.DEV_DB_NAME;

mongoose
  .connect(DB_URL, { dbName })
  .then(() => {
    logger.info("Connected to MongoDB.");
  })
  .catch(error => {
    logger.error("Failed to connect to MongoDB:", error);
  });

const port = 4000;

const server = app.listen(port, () => {
  logger.info(`Server is running on port: ${port}`);
});

process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});
