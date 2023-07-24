import { MiniUser, User, FollowingResult } from "../../../shared/interfaces/user.interface";
import { httpService } from "./http.service";
import { storageService } from "./storage.service";
import { handleServerResponse } from "./util/utils.service";

function getLoggedinUser(): User | null {
  return storageService.get("loggedinUser");
}

function getMiniUser(user: User): MiniUser {
  const miniUser = {
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    imgUrl: user.imgUrl,
    isAdmin: user.isAdmin,
    isVerified: user.isVerified,
    bio: user.bio,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    isFollowing: user.isFollowing,
  };

  return miniUser;
}

function getDefaultUserImgUrl(): string {
  return "https://res.cloudinary.com/dng9sfzqt/image/upload/v1681677382/user-chirper_ozii7u.png";
}

async function query(): Promise<User[]> {
  try {
    const respose = await httpService.get(`user`);
    return handleServerResponse<User[]>(respose);
  } catch (err) {
    console.log("User service: err in query", err);
    throw err;
  }
}

async function getById(userId: string): Promise<User> {
  try {
    const respose = await httpService.get(`user/${userId}`);
    return handleServerResponse<User>(respose);
  } catch (err) {
    console.log("User service: err in getById", err);
    throw err;
  }
}

async function getByUsername(username: string): Promise<User> {
  try {
    const respose = await httpService.get(`user/username/${username}`);
    return handleServerResponse<User>(respose);
  } catch (err) {
    console.log("User service: err in getByUsername", err);
    throw err;
  }
}

async function followUser(userId: string, postId?: string): Promise<FollowingResult> {
  try {
    const endpoint = _getFollowingEndpoint(userId, postId);
    const respose = await httpService.post(endpoint);
    return handleServerResponse<FollowingResult>(respose);
  } catch (err) {
    console.log("User service: err in addFollowiing", err);
    throw err;
  }
}

async function unFollowUser(userId: string, postId?: string): Promise<FollowingResult> {
  try {
    const endpoint = _getFollowingEndpoint(userId, postId);
    const respose = await httpService.delete(endpoint);
    return handleServerResponse<FollowingResult>(respose);
  } catch (err) {
    console.log("User service: err in removeFollowiing", err);
    throw err;
  }
}

function _getFollowingEndpoint(userId: string, postId?: string): string {
  return postId ? `user/${userId}/following/${postId}/fromPost` : `user/follow/${userId}`;
}

export const userService = {
  query,
  getById,
  getByUsername,
  getLoggedinUser,
  getMiniUser,
  getDefaultUserImgUrl,
  followUser,
  unFollowUser,
};
