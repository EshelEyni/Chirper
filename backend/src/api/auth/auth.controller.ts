import { Request, Response } from "express";
import { User } from "../../../../shared/interfaces/user.interface";

const { logger } = require("../../services/logger.service");
const authService = require("./auth.service");
const { asyncErrorCatcher } = require("../../services/error.service");
const { AppError, handleMissingUserCredentialsError } = require("../../services/error.service");

const login = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await authService.login(username, password);

  const loginToken = authService.getLoginToken(user as unknown as User);
  logger.info("User login: ", user, loginToken);
  res.cookie("loginToken", loginToken);

  res.status(200).json({
    status: "success",
    data: user,
  });
});

const signup = asyncErrorCatcher(async (req: Request, res: Response) => {
  const user = req.body as unknown as User;
  handleMissingUserCredentialsError(user);
  const savedUser = await authService.signup(user);
  const token = authService.signToken(savedUser.id);
  // res.cookie("loginToken", loginToken);

  res.status(201).json({
    status: "success",
    token,
    data: savedUser,
  });
});

const logout = asyncErrorCatcher(async (req: Request, res: Response) => {
  res.clearCookie("loginToken");
  res.send({
    status: "success",
    data: {
      msg: "Logged out successfully",
    },
  });
});

module.exports = {
  login,
  signup,
  logout,
};
