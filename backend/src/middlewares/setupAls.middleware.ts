import { Request, Response, NextFunction } from "express";
import { User } from "../../../shared/interfaces/user.interface";

const { asyncLocalStorage } = require("../services/als.service");
const authService = require("../api/auth/auth.service");

async function setupAsyncLocalStorage(req: Request, res: Response, next: NextFunction) {
  const storage = {};
  asyncLocalStorage.run(storage, async () => {
    if (!req.cookies) return await next();
    const loggedinUser = await authService.validateToken(req.cookies.loginToken);

    if (loggedinUser) {
      const alsStore = asyncLocalStorage.getStore() as Record<string, User | undefined>;
      alsStore.loggedinUser = loggedinUser;
    }
    await next();
  });
}

module.exports = setupAsyncLocalStorage;
