import { User } from "../../../shared/types/user.interface";
import httpService from "./http.service";
import { handleServerResponse } from "./util/utils.service";

function getDefaultUserImgUrl(): string {
  return "https://res.cloudinary.com/dng9sfzqt/image/upload/v1681677382/user-chirper_ozii7u.png";
}

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

export default { query, getById, getByUsername, getDefaultUserImgUrl };
