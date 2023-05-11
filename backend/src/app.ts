import { NextFunction, Request, Response } from "express";
const express = require("express");
const { log } = require("./middlewares/logger.middleware");
const path = require("path");
const setupAsyncLocalStorage = require("./middlewares/setupAls.middleware");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { AppError, errorHandler } = require("./services/error.service");
const app = express();

// Express App Config
app.use(cookieParser());
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  log(req, res, next);
  next();
});

// cors
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "public")));
} else {
  const corsOptions = {
    origin: [
      "http://127.0.0.1:8080",
      "http://localhost:8080",
      "http://127.0.0.1:5173",
      "http://localhost:5173",
    ],
    credentials: true,
  };
  app.use(cors(corsOptions));
}

// app.all("*", setupAsyncLocalStorage);

const userRoutes = require("./api/user/user.routes");
const postRoutes = require("./api/post/post.routes");
const gifRoutes = require("./api/gif/gif.routes");
const locationRoutes = require("./api/location/location.routes");
const authRoutes = require("./api/auth/auth.routes");
// import { setupSocketAPI } from "./services/socket.service";

app.use("/api/post", postRoutes());
app.use("/api/user", userRoutes());
app.use("/api/gif", gifRoutes());
app.use("/api/location", locationRoutes());
app.use("/api/auth", authRoutes());
// setupSocketAPI(http);

app.get("/**", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;
