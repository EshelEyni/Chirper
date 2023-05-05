import { Request, Response } from "express";
import { authService } from "./auth.service";
import { logger } from "../../services/logger.service";
import { User } from "../../../shared/interfaces/user.interface";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  try {
    const user = await authService.login(username, password);

    const loginToken = authService.getLoginToken(user as unknown as User);
    logger.info("User login: ", user, loginToken);
    res.cookie("loginToken", loginToken);

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    logger.error("Failed to Login " + err);
    res.status(401).send({
      status: "fail",
      data: {
        username: "Invalid username or password",
        password: "Invalid username or password",
      },
    });
  }
}

export async function signup(req: Request, res: Response) {
  try {
    const { username, password, fullname } = req.body as unknown as User;
    if (!username || !password || !fullname) {
      res.status(400).send({
        status: "fail",
        data: {
          ...(username ? {} : { username: "No username provided" }),
          ...(password ? {} : { password: "No password provided" }),
          ...(fullname ? {} : { fullname: "No fullname provided" }),
        },
      });
      return;
    }
    
    const account = await authService.signup(username, password, fullname);
    logger.debug(`auth.route - new account created: ` + JSON.stringify(account));
    const user = await authService.login(username, password);
    const loginToken = authService.getLoginToken(user as unknown as User);
    logger.info("User login: ", user);
    res.cookie("loginToken", loginToken);

    res.status(201).json({
      status: "success",
      data: user,
    });
  } catch (err) {
    logger.error("Failed to signup " + err);
    res.status(500).send({
      status: "error",
      message: "Failed to signup",
    });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    res.clearCookie("loginToken");
    res.send({
      status: "success",
      data: {
        msg: "Logged out successfully",
      },
    });
  } catch (err) {
    res.status(500).send({
      status: "error",
      message: "Failed to logout",
    });
  }
}
