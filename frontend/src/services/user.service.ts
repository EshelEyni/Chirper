import { Post } from "../../../shared/interfaces/post.interface";
import { User, FollowingResult } from "../../../shared/interfaces/user.interface";
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

async function followUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getFollowingEndpoint(userId, postId);
  const respose = await httpService.post(endpoint);
  return handleServerResponse<FollowingResult | Post>(respose);
}

async function unFollowUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getFollowingEndpoint(userId, postId);
  const respose = await httpService.delete(endpoint);
  return handleServerResponse<FollowingResult | Post>(respose);
}

function _getFollowingEndpoint(userId: string, postId?: string): string {
  return postId ? `user/${userId}/follow/${postId}/fromPost` : `user/follow/${userId}`;
}

export default {
  query,
  getById,
  getByUsername,
  getDefaultUserImgUrl,
  followUser,
  unFollowUser,
};
