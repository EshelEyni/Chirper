import { User } from "../../../../shared/types/user";
import httpService from "../http/httpService";
import { handleServerResponse } from "../util/utilService";

async function query(): Promise<User[]> {
  const respose = await httpService.get(`user`);
  return handleServerResponse<User[]>(respose);
}

async function getById(userId: string): Promise<User> {
  const respose = await httpService.get(`user/${userId}`);
  return handleServerResponse<User>(respose);
}

async function getByUsername(username: string): Promise<User> {
  const respose = await httpService.get(`user/username/${username}`);
  return handleServerResponse<User>(respose);
}

export default { query, getById, getByUsername };
