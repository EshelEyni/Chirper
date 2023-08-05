import { Request, Response } from "express";
import { User, UserCredenitials } from "../../../../../shared/interfaces/user.interface";
import authService from "../service/auth.service";
import { AppError, asyncErrorCatcher } from "../../../services/error/error.service";

const login = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) throw new AppError("Username and password are required", 400);
  const { user, token } = await authService.login(username, password);
  _sendUserTokenSuccessResponse(res, token, user);
});

const autoLogin = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { loginToken } = req.cookies;
  if (!loginToken || typeof loginToken !== "string") {
    res.status(200).send({
      status: "success",
      data: null,
    });
    return;
  }
  const { user, token } = await authService.autoLogin(loginToken);
  _sendUserTokenSuccessResponse(res, token, user);
});

const signup = asyncErrorCatcher(async (req: Request, res: Response) => {
  const userCreds = req.body as unknown as UserCredenitials;
  const { isValid, msg } = _validateUserCreds(userCreds);
  if (!isValid) throw new AppError(msg, 400);
  const { user, token } = await authService.signup(userCreds);
  _sendUserTokenSuccessResponse(res, token, user, 201);
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
  for (const field of ["currentPassword", "newPassword", "newPasswordConfirm"])
    if (!req.body[field]) throw new AppError(`${field} is required`, 400);
  const { loggedinUserId } = req;
  if (!loggedinUserId) throw new AppError("You are not logged in", 401);
  const { user, token } = await authService.updatePassword(
    loggedinUserId,
    currentPassword,
    newPassword,
    newPasswordConfirm
  );

  _sendUserTokenSuccessResponse(res, token, user);
});

const sendPasswordResetEmail = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) throw new AppError("Email is required", 400);
  const resetURL = `${req.protocol}://${req.get("host")}/api/auth/resetPassword/`;
  await authService.sendPasswordResetEmail(email, resetURL);
  res.status(200).send({
    status: "success",
    message: "Password reset email sent successfully",
  });
});

const resetPassword = asyncErrorCatcher(async (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token) throw new AppError("Token is required", 400);
  const { password, passwordConfirm } = req.body;
  for (const field of ["password", "passwordConfirm"])
    if (!req.body[field]) throw new AppError(`${field} is required`, 400);

  const { user, token: newToken } = await authService.resetPassword(
    token,
    password,
    passwordConfirm
  );
  _sendUserTokenSuccessResponse(res, newToken, user);
});

const _sendUserTokenSuccessResponse = (res: Response, token: string, user: User, status = 200) => {
  const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;
  res.cookie("loginToken", token, {
    expires: new Date(Date.now() + NINETY_DAYS),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(status).send({
    status: "success",
    token,
    data: user,
  });
};

const _validateUserCreds = (userCreds: UserCredenitials) => {
  const requiredFields: (keyof UserCredenitials)[] = [
    "username",
    "password",
    "passwordConfirm",
    "email",
    "fullname",
  ];
  if (!userCreds) return { isValid: false, msg: "User credentials are required" };
  for (const field of requiredFields)
    if (!userCreds[field]) return { isValid: false, msg: `${field} is required` };
  return { isValid: true, msg: "" };
};

export { login, autoLogin, signup, logout, sendPasswordResetEmail, resetPassword, updatePassword };
