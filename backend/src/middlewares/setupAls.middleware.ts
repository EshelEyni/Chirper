import { Request, Response, NextFunction } from "express";
import { asyncLocalStorage } from "../services/als.service.js";
import { authService } from "../api/auth/auth.service.js";
import { User } from "../../shared/interfaces/user.interface"

async function setupAsyncLocalStorage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const storage = {};
  asyncLocalStorage.run(storage, async () => {
    if (!req.cookies) return await next();
    const loggedinUser = await authService.validateToken(
      req.cookies.loginToken
    );

    if (loggedinUser) {
      const alsStore = asyncLocalStorage.getStore() as Record<
        string,
        User | undefined
      >;
      alsStore.loggedinUser = loggedinUser;
    }
    await next();
  });
}

export default setupAsyncLocalStorage;
