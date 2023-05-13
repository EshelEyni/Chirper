import { Request, Response, NextFunction } from "express";
import { asyncLocalStorage } from "../services/als.service";
import { asyncErrorCatcher } from "../services/error.service";
import tokenService from "../services/token.service";

const setupAsyncLocalStorage = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction) => {
    const storage = {};
    asyncLocalStorage.run(storage, async () => {
      const token = tokenService.getTokenFromRequest(req);
      if (!token) {
        return next();
      }
      const verifiedToken = await tokenService.verifyToken(token);

      if (verifiedToken) {
        const alsStore = asyncLocalStorage.getStore() as Record<string, string>;
        alsStore.loggedinUserId = verifiedToken.id;
      }
      next();
    });
  }
);

export default setupAsyncLocalStorage;
