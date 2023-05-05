// const logger = require('../services/logger.service')
// const authService = require('../api/auth/auth.service')
import { authService } from "../api/auth/auth.service";
// import { logger } from '../services/logger.service'

import { Request, Response, NextFunction } from "express";

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req?.cookies?.loginToken)
    return res.status(401).send("Not Authenticated");
  const loggedinUser = await authService.validateToken(req.cookies.loginToken);
  if (!loggedinUser) return res.status(401).send("Not Authenticated");
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // if (!req?.cookies?.loginToken)
  //   return res.status(401).send("Not Authenticated");
  // const loggedinUser = await authService.validateToken(req.cookies.loginToken);
  // if (!loggedinUser.isAdmin) {
  //   // logger.warn(loggedinUser.fullname + "attempted to perform admin action");
  //   res.status(403).end("Not Authorized");
  //   return;
  // }
  // next();
}

// module.exports = requireAuth

export { requireAuth, requireAdmin };
