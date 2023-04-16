import { MiniUser, User } from "../models/user.model";
import { storageService } from "./storage.service";

function getLoggedinUser(): User | null {
  return storageService.get("loggedinUser");
}

function getMiniUser(user: User): MiniUser {
  const miniUser = {
    _id: user._id,
    username: user.username,
    fullname: user.fullname,
    imgUrl: user.imgUrl,
  };

  return miniUser;
}

function getDefaultUserImgUrl(): string {
  return "https://res.cloudinary.com/dng9sfzqt/image/upload/v1681677382/user-chirper_ozii7u.png";
}

export const userService = {
  getLoggedinUser,
  getMiniUser,
  getDefaultUserImgUrl,
};
