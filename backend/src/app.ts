import { NextFunction, Request, Response } from "express";
const express = require("express");
const path = require("path");
const setupAsyncLocalStorage = require("./middlewares/setupAls.middleware");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// Express App Config
app.use(cookieParser());
app.use(express.json());

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

// import authRoutes from "./api/auth/auth.routes";
// import { setupSocketAPI } from "./services/socket.service";

app.use("/api/post", postRoutes());
app.use("/api/user", userRoutes());
app.use("/api/gif", gifRoutes());
app.use("/api/location", locationRoutes());
// app.use("/api/auth", authRoutes);
// setupSocketAPI(http);

app.get("/**", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;
