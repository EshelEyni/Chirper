import { Request, Response, NextFunction } from "express";
import { asyncLocalStorage } from "../services/als.service";
import authService from "../api/auth/auth.service";

async function setupAsyncLocalStorage(req: Request, res: Response, next: NextFunction) {
  const storage = {};
  asyncLocalStorage.run(storage, async () => {
    if (!req.cookies) return await next();
    const loggedinUserId = await authService.verifyToken(req.cookies.loginToken);

    if (loggedinUserId) {
      const alsStore = asyncLocalStorage.getStore() as Record<
        string,
        { id: string; timeStamp: number } | undefined
      >;
      alsStore.loggedinUserId = loggedinUserId;
    }
    await next();
  });
}

module.exports = setupAsyncLocalStorage;
