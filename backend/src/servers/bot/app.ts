import { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import requestSanitizer from "../../middlewares/HTMLSanitizer/HTMLSanitizerMiddleware";
import hpp from "hpp";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { requestLogger } from "../../middlewares/logger/loggerMiddleware";
import { AppError, errorHandler } from "../../services/error/errorService";
import setupAsyncLocalStorage from "../../middlewares/setupALS/setupALSMiddleware";
import botRouter from "../../routers/bot/botRouter";
import compression from "compression";
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

// Parameter Pollution Protection - prevents duplicate query params ex: ?sort=duration&sort=price, whitelist allows duplicate params
app.use(
  hpp({
    whitelist: [],
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

app.use("/api/bot", botRouter);

app.get("/**", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
