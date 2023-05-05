// import { logger } from "./services/logger.service.js";
const { logger } = require("./services/logger.service");

const app = require("./app");
const config = require("./config");

import mongoose from "mongoose";

const DB = config.dbURL;

mongoose
  .connect(DB)
  .then(() => {
    logger.info("Connected to MongoDB.");
  })
  .catch((error) => {
    logger.error("Failed to connect to MongoDB:", error);
  });

const port = process.env.PORT || 3030;

app.listen(port, () => {
  logger.info(`Server is running on port: ${port}`);
});
