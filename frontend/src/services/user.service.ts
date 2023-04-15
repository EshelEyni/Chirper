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

export const userService = {
  getLoggedinUser,
  getMiniUser,
};
