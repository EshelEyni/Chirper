import { JsendResponse } from "../../../shared/interfaces/system.interface";
import { User } from "../../../shared/interfaces/user.interface";
import { UserCredentials } from "../types/auth.types";
import { httpService } from "./http.service";

async function autoLogin(): Promise<User | null> {
  const response = (await httpService.post("auth/auto-login")) as unknown as JsendResponse;
  const user = response.data;
  return user;
}

async function login(username: string, password: string): Promise<User> {
  const response = (await httpService.post("auth/login", {
    username,
    password,
  })) as unknown as JsendResponse;
  const user = response.data;
  return user;
}

async function signup(userCredentials: UserCredentials): Promise<User> {
  const response = (await httpService.post(
    "auth/signup",
    userCredentials
  )) as unknown as JsendResponse;
  const savedUser = response.data;
  return savedUser;
}

async function logout(): Promise<void> {
  const res = await httpService.post("auth/logout");
  return res;
}

export const authService = {
  login,
  signup,
  logout,
  autoLogin,
};
