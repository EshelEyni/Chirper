import rateLimit from "express-rate-limit";
import { NextFunction, Request, Response } from "express";

const getRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: "Too many GET requests, please try again later",
});

const postRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many POST requests, please try again later",
});

const patchRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many PATCH requests, please try again later",
});

const deleteRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many DELETE requests, please try again later",
});

const authRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many authentication requests, please try again later",
});

const requestLimiter = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Refactor this to use a switch statement
  if (req.method === "GET") {
    getRequestLimiter(req, res, next);
  } else if (req.method === "POST") {
    postRequestLimiter(req, res, next);
  } else if (req.method === "PATCH") {
    patchRequestLimiter(req, res, next);
  } else if (req.method === "DELETE") {
    deleteRequestLimiter(req, res, next);
  } else {
    next();
  }
};

export { authRequestLimiter, requestLimiter };
