import { Request, Response, NextFunction } from "express";
import { AppError, asyncErrorCatcher } from "../../services/error/error.service";
import { UserModel } from "../../api/user/models/user.model";
import tokenService from "../../services/token/token.service";
import { isValidId } from "../../services/util/util.service";

const checkUserAuthentication = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = tokenService.getTokenFromRequest(req);
    if (!token)
      return next(new AppError("You are not logged in! Please log in to get access.", 401));
    const verifiedToken = await tokenService.verifyToken(token);
    if (!verifiedToken) return next(new AppError("Invalid Token", 401));
    const { id, timeStamp } = verifiedToken;

    if (!isValidId(id)) return next(new AppError("Invalid User Id", 401));
    const currentUser = await UserModel.findById(id);
    if (!currentUser)
      return next(new AppError("The user belonging to this token does not exist.", 401));
    const changedPasswordAfter = currentUser.changedPasswordAfter(timeStamp);
    if (changedPasswordAfter)
      return next(new AppError("User recently changed password! Please log in again.", 401));
    req.loggedInUserId = id;
    next();
  }
);

const checkAdminAuthorization = asyncErrorCatcher(
  async (req: Request, res: Response, next: NextFunction) => {
    const { loggedInUserId } = req;
    if (!loggedInUserId) throw new AppError("User not logged in", 401);
    const user = await UserModel.findById(loggedInUserId);
    if (!user) throw new AppError("User not found", 404);
    if (!user.isAdmin) throw new AppError("User not authorized", 403);
    next();
  }
);

export { checkUserAuthentication, checkAdminAuthorization };
