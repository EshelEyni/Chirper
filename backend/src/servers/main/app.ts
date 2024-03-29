import { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import ExpressMongoSanitize from "express-mongo-sanitize";
import requestSanitizer from "../../middlewares/HTMLSanitizer/HTMLSanitizerMiddleware";
import hpp from "hpp";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { requestLogger } from "../../middlewares/logger/loggerMiddleware";
import { AppError, errorHandler } from "../../services/error/errorService";
import setupAsyncLocalStorage from "../../middlewares/setupALS/setupALSMiddleware";
import userRouter from "../../routers/user/userRouter";
import userRelationRouter from "../../routers/userRelation/userRelationRouter";
import postRouter from "../../routers/post/postRouter";
import gifRouter from "../../routers/GIF/GIFRouter";
import locationRouter from "../../routers/location/locationRouter";
import authRouter from "../../routers/auth/authRouter";
import botRouter from "../../routers/bot/botRouter";
import { requestLimiter } from "../../services/rateLimiterService";

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
app.use("/api/bot", botRouter);
app.use("/api/post", postRouter);
app.use("/api/gif", gifRouter);
app.use("/api/location", locationRouter);
app.use("/api/auth", authRouter);

app.get("/**", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
