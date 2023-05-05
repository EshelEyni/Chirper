const express = require("express");
const path = require("path");
const setupAsyncLocalStorage = require("./middlewares/setupAls.middleware");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

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
    origin: ["http://127.0.0.1:8080", "http://localhost:8080", "http://127.0.0.1:5173", "http://localhost:5173"],
    credentials: true,
  };
  app.use(cors(corsOptions));
}

// Express Routing:
app.all("*", setupAsyncLocalStorage);

const userRoutes = require("./api/user/user.routes");
const postRoutes = require("./api/post/post.routes");
const gifRoutes = require("./api/gif/gif.routes");
const locationRoutes = require("./api/location/location.routes");

// import authRoutes from "./api/auth/auth.routes";
// import { setupSocketAPI } from "./services/socket.service";

app.use("/api/post", postRoutes);
app.use("/api/user", userRoutes());
app.use("/api/gif", gifRoutes);
app.use("/api/location", locationRoutes);
// app.use("/api/auth", authRoutes);
// setupSocketAPI(http);

app.get("/**", (req: any, res: { sendFile: (arg0: any) => void }) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;
