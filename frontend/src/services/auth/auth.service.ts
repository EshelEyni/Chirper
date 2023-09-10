import { JsendResponse } from "../../../../shared/types/system.interface";
import { User } from "../../../../shared/types/user.interface";
import { UserCredentials } from "../../types/auth.types";
import httpService from "../http/httpService";
import { handleServerResponse } from "../util/utilService";

async function loginWithToken(): Promise<User | null> {
  const response = (await httpService.post("auth/login/with-token")) as unknown as JsendResponse;
  return handleServerResponse<User>(response);
}

async function login(username: string, password: string): Promise<User> {
  const response = (await httpService.post("auth/login", {
    username,
    password,
  })) as unknown as JsendResponse;

  return handleServerResponse<User>(response);
}

async function signup(userCredentials: UserCredentials): Promise<User> {
  const response = (await httpService.post(
    "auth/signup",
    userCredentials
  )) as unknown as JsendResponse;

  return handleServerResponse<User>(response);
}

async function logout(): Promise<void> {
  const res = await httpService.post("auth/logout");
  return res;
}

export default { login, signup, logout, loginWithToken };
