import setupAsyncLocalStorage from "./middlewares/setupAls.middleware";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { logger } from "./services/logger.service";

const app = express();
const http = require("http").createServer(app);

// Express App Config
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));

// cors
if (process.env.NODE_ENV === "production") {
  // Express serve static files on production environment
  app.use(express.static(path.resolve(__dirname, "public")));
} else {
  // Configuring CORS
  const corsOptions = {
    // Make sure origin contains the url your frontend is running on
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

// Express Routing:
app.all("*", setupAsyncLocalStorage);

import postRoutes from "./api/post/post.routes";
import userRoutes from "./api/user/user.routes";
import gifRoutes from "./api/gif/gif.routes";
// import authRoutes from "./api/auth/auth.routes";
// import { setupSocketAPI } from "./services/socket.service";

app.use("/api/post", postRoutes);
app.use("/api/user", userRoutes);
app.use("/api/gif", gifRoutes);
// app.use("/api/auth", authRoutes);
// setupSocketAPI(http);

app.get("/**", (req: any, res: { sendFile: (arg0: any) => void }) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3030;
http.listen(port, () => {
  logger.info("Server is running on port: " + port);
});
