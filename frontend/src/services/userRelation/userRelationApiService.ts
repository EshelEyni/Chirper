import { Post } from "../../../../shared/types/post";
import { FollowingResult } from "../../../../shared/types/user";
import httpService from "../http/httpService";
import { handleServerResponseData } from "../util/utilService";

enum PathType {
  FOLLOW = "follow",
  MUTE = "mute",
  BLOCK = "block",
}

async function followUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ pathType: PathType.FOLLOW, userId, postId });
  const respose = await httpService.post(endpoint);
  return handleServerResponseData<FollowingResult | Post>(respose);
}

async function unFollowUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ pathType: PathType.FOLLOW, userId, postId });
  const respose = await httpService.delete(endpoint);
  return handleServerResponseData<FollowingResult | Post>(respose);
}

async function muteUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ pathType: PathType.MUTE, userId, postId });
  const respose = await httpService.post(endpoint);
  return handleServerResponseData<FollowingResult | Post>(respose);
}

async function unMuteUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ pathType: PathType.MUTE, userId, postId });
  const respose = await httpService.delete(endpoint);
  return handleServerResponseData<FollowingResult | Post>(respose);
}

async function blockUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ pathType: PathType.BLOCK, userId, postId });
  const respose = await httpService.post(endpoint);
  return handleServerResponseData<FollowingResult | Post>(respose);
}

async function unBlockUser(userId: string, postId?: string): Promise<FollowingResult | Post> {
  const endpoint = _getEndpoint({ pathType: PathType.BLOCK, userId, postId });
  const respose = await httpService.delete(endpoint);
  return handleServerResponseData<FollowingResult | Post>(respose);
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
