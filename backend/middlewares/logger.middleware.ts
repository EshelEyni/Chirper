const logger = require('../services/logger.service')
import { Request, Response, NextFunction } from "express";

async function log( req: Request, res: Response, next: NextFunction) {
  logger.info('Req was made')
  next()
}

module.exports = {
  log
}
