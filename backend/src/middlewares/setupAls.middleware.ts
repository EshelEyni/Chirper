import { Request, Response, NextFunction } from "express";
import { asyncLocalStorage } from "../services/als.service";
import authService from "../api/auth/auth.service";
import { asyncErrorCatcher } from "../services/error.service";

const setupAsyncLocalStorage = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction) => {
    const storage = {};
    asyncLocalStorage.run(storage, async () => {
      const { cookies } = req;
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
      }

      const tokenToVerify = cookies.token || token;
      if (!tokenToVerify) {
        return next();
      }
      const verifiedToken = await authService.verifyToken(tokenToVerify);

      if (verifiedToken) {
        const alsStore = asyncLocalStorage.getStore() as Record<string, string>;
        alsStore.loggedinUserId = verifiedToken.id;
      }
      next();
    });
  }
);

export default setupAsyncLocalStorage;
