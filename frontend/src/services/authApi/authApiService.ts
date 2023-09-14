import { JsendResponse } from "../../../../shared/types/system";
import { User, UserCredenitials } from "../../../../shared/types/user";
import httpService from "../http/httpService";
import { handleServerResponseData } from "../util/utilService";

async function loginWithToken(): Promise<User | null> {
  const response = (await httpService.post("auth/login/with-token")) as unknown as JsendResponse;
  return handleServerResponseData<User>(response);
}

async function login(username: string, password: string): Promise<User> {
  const response = (await httpService.post("auth/login", {
    username,
    password,
  })) as unknown as JsendResponse;

  return handleServerResponseData<User>(response);
}

async function signup(userCredentials: UserCredenitials): Promise<User> {
  const response = (await httpService.post(
    "auth/signup",
    userCredentials
  )) as unknown as JsendResponse;

  return handleServerResponseData<User>(response);
}

async function logout(): Promise<void> {
  const res = await httpService.post("auth/logout");
  return res;
}

export default { login, signup, logout, loginWithToken };
