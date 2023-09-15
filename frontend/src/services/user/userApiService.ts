import { User } from "../../../../shared/types/user";
import httpService from "../http/httpService";
import { handleServerResponseData } from "../util/utilService";

async function query(): Promise<User[]> {
  const respose = await httpService.get(`user`);
  return handleServerResponseData<User[]>(respose);
}

async function getById(userId: string): Promise<User> {
  const respose = await httpService.get(`user/${userId}`);
  return handleServerResponseData<User>(respose);
}

async function getByUsername(username: string): Promise<User> {
  const respose = await httpService.get(`user/username/${username}`);
  return handleServerResponseData<User>(respose);
}

export default { query, getById, getByUsername };
