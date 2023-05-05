import { logger } from "./services/logger.service.js";
import app from "./app.js";
import mongoose from "mongoose";
import config from "./config/index.js";

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
