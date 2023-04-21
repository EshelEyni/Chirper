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

    res.json(user);
  } catch (err) {
    logger.error("Failed to Login " + err);
    res.status(401).send({ err: "Failed to Login" });
  }
}

export async function signup(req: Request, res: Response) {
  try {
    const { username, password, fullname } = req.body as unknown as User;
    const account = await authService.signup(username, password, fullname);
    logger.debug(
      `auth.route - new account created: ` + JSON.stringify(account)
    );
    const user = await authService.login(username, password);
    const loginToken = authService.getLoginToken(user as unknown as User);
    logger.info("User login: ", user);
    res.cookie("loginToken", loginToken);

    res.json(user);
  } catch (err) {
    logger.error("Failed to signup " + err);
    res.status(500).send({ err: "Failed to signup" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    res.clearCookie("loginToken");
    res.send({ msg: "Logged out successfully" });
  } catch (err) {
    res.status(500).send({ err: "Failed to logout" });
  }
}
