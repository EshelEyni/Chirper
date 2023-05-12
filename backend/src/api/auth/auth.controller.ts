import { Request, Response } from "express";
import { User } from "../../../../shared/interfaces/user.interface";
import authService from "./auth.service";
import { AppError, asyncErrorCatcher } from "../../services/error.service";

const login = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError("Username and password are required", 400);
  }

  const { user, token } = await authService.login(username, password);
  // res.cookie("loginToken", loginToken);

  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
});

const signup = asyncErrorCatcher(async (req: Request, res: Response) => {
  const user = req.body as unknown as User;
  const { savedUser, token } = await authService.signup(user);
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

const updatePassword = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  const { loggedinUserId } = req;
  if (!loggedinUserId) throw new AppError("User not logged in", 401);
  const { user, newToken } = await authService.updatePassword(
    loggedinUserId,
    currentPassword,
    newPassword,
    newPasswordConfirm
  );

  res.status(200).json({
    status: "success",
    token: newToken,
    data: user,
  });
});

const sendPasswordResetEmail = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new AppError("Email is required", 400);
  const resetURL = `${req.protocol}://${req.get("host")}/api/auth/resetPassword/`;
  await authService.sendPasswordResetEmail(email, resetURL);
  res.status(200).json({
    status: "success",
    message: "Password reset email sent successfully",
  });
});

const resetPassword = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;
  const { user, newToken } = await authService.resetPassword(token, password, passwordConfirm);

  res.status(200).json({
    status: "success",
    token: newToken,
    data: user,
  });
});

export { login, signup, logout, sendPasswordResetEmail, resetPassword, updatePassword };
