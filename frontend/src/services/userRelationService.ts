import { Post } from "../../../shared/types/post.interface";
import { FollowingResult } from "../../../shared/types/user.interface";
import httpService from "./http/httpService";
import { handleServerResponse } from "./util/utilService";

enum PathType {
  FOLLOW = "follow",
  MUTE = "mute",
  BLOCK = "block",
}

async function followUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ userId, postId });
  const respose = await httpService.post(endpoint);
  return handleServerResponse<FollowingResult | Post>(respose);
}

async function unFollowUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ userId, postId });
  const respose = await httpService.delete(endpoint);
  return handleServerResponse<FollowingResult | Post>(respose);
}

async function muteUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ pathType: PathType.MUTE, userId, postId });
  const respose = await httpService.post(endpoint);
  return handleServerResponse<FollowingResult | Post>(respose);
}

async function unMuteUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ pathType: PathType.MUTE, userId, postId });
  const respose = await httpService.delete(endpoint);
  return handleServerResponse<FollowingResult | Post>(respose);
}

async function blockUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ pathType: PathType.BLOCK, userId, postId });
  const respose = await httpService.post(endpoint);
  return handleServerResponse<FollowingResult | Post>(respose);
}

async function unBlockUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ pathType: PathType.BLOCK, userId, postId });
  const respose = await httpService.delete(endpoint);
  return handleServerResponse<FollowingResult | Post>(respose);
}

function _getEndpoint(
  {
    pathType,
    userId,
    postId,
  }: {
    pathType?: PathType;
    userId: string;
    postId?: string;
  } = {
    pathType: PathType.FOLLOW,
    userId: "",
    postId: "",
  }
): string {
  return postId ? `user/${userId}/${pathType}/${postId}/fromPost` : `user/${pathType}/${userId}`;
}

export default {
  followUser,
  unFollowUser,
  muteUser,
  unMuteUser,
  blockUser,
  unBlockUser,
};
