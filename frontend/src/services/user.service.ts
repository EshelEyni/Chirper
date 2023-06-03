import { MiniUser, User } from "../../../shared/interfaces/user.interface";
import { httpService } from "./http.service";
import { storageService } from "./storage.service";
import { utilService } from "./util.service/utils.service";

function getLoggedinUser(): User | null {
  return storageService.get("loggedinUser");
}

function getMiniUser(user: User): MiniUser {
  const miniUser = {
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    imgUrl: user.imgUrl,
  };

  return miniUser;
}

function getDefaultUserImgUrl(): string {
  return "https://res.cloudinary.com/dng9sfzqt/image/upload/v1681677382/user-chirper_ozii7u.png";
}

async function query(): Promise<User[]> {
  try {
    const respose = await httpService.get(`user`);
    return utilService.handleServerResponse<User[]>(respose);
  } catch (err) {
    console.log("User service: err in query", err);
    throw err;
  }
}

async function getById(userId: string): Promise<User> {
  try {
    const respose = await httpService.get(`user/${userId}`);
    return utilService.handleServerResponse<User>(respose);
  } catch (err) {
    console.log("User service: err in getById", err);
    throw err;
  }
}

export const userService = {
  query,
  getById,
  getLoggedinUser,
  getMiniUser,
  getDefaultUserImgUrl,
};
