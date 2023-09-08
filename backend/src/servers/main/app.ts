import { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import requestSanitizer from "../../middlewares/html-sanitizer/html-sanitizer.middleware";
import hpp from "hpp";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { requestLogger } from "../../middlewares/logger/logger.middleware";
import { AppError, errorHandler } from "../../services/error/error.service";
import setupAsyncLocalStorage from "../../middlewares/setupAls/setupAls.middleware";
import userRouter from "../../api/user/routers/user.router";
import userRelationRouter from "../../api/user/routers/user-relation.router";
import postRouter from "../../api/post/router/post.router";
import gifRouter from "../../api/gif/router/gif.router";
import locationRouter from "../../api/location/router/location.router";
import botRouter from "../../api/bot/router/bot.router";
import authRouter from "../../api/auth/router/auth.router";
import { requestLimiter } from "../../services/rate-limiter.service";
import compression from "compression";

const isProdEnv = process.env.NODE_ENV === "production";

const app = express();
app.use(compression());

app.use(helmet());
app.use(cookieParser());
app.use(
  express.json({
    limit: "15kb",
  })
);

app.use(requestLimiter);
app.use(ExpressMongoSanitize());
app.use(requestSanitizer);
app.use(
  hpp({
    whitelist: [], // add whitelisted query params here
  })
);

// cors
if (isProdEnv) {
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

app.all("*", setupAsyncLocalStorage);

if (!isProdEnv)
  app.use((req: Request, res: Response, next: NextFunction) => {
    requestLogger(req, res, next);
  });

app.use("/api/user", userRelationRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/gif", gifRouter);
app.use("/api/location", locationRouter);
app.use("/api/bot", botRouter);
app.use("/api/auth", authRouter);

app.get("/**", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
