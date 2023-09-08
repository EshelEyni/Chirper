import { Request, Response, NextFunction } from "express";
import { asyncLocalStorage } from "../../Services/ALSService";
import { asyncErrorCatcher } from "../../Services/Error/ErrorService";
import tokenService from "../../Services/Token/TokenService";
import { alStoreType } from "../../Types/App";

const setupAsyncLocalStorage = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction) => {
    const storage = {};
    asyncLocalStorage.run(storage, async () => {
      const token = tokenService.getTokenFromRequest(req);
      if (!token) return next();
      const verifiedToken = await tokenService.verifyToken(token);
      if (!verifiedToken) return next();
      const alsStore = asyncLocalStorage.getStore() as alStoreType;
      alsStore.loggedInUserId = verifiedToken.id;
      next();
    });
  }
);

export default setupAsyncLocalStorage;
