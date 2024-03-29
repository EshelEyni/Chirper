import httpService from "../http/httpService";
import {
  NewPost,
  Post,
  PostReplyResult,
  PostRepostResult,
  PostStats,
  PostStatsBody,
} from "../../../../shared/types/post";
import { JsendResponse } from "../../../../shared/types/system";
import { handleServerResponseData } from "../util/utilService";
import qs from "qs";

type AddPollVoteConfig = {
  postId: string;
  optionIdx: number;
};

const BASE_URL = "post";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function query(queryObj?: any): Promise<Post[]> {
  const queryString = queryObj ? "&" + qs.stringify(queryObj) : "";
  const response = await httpService.get(
    `${BASE_URL}?sort=-createdAt&parentPostId[exists]=false&limit=35${queryString}`
  );

  return handleServerResponseData<Post[]>(response);
}

async function getById(postId: string): Promise<Post> {
  const response = await httpService.get(`${BASE_URL}/${postId}`);
  return handleServerResponseData<Post>(response);
}

async function remove(postId: string) {
  await httpService.delete(`${BASE_URL}/${postId}`);
}

async function add(posts: NewPost[]): Promise<Post> {
  if (!posts.length) throw new Error("postService: Cannot add empty post");
  let res: JsendResponse | null = null;
  if (posts.length > 1) {
    res = await httpService.post(`${BASE_URL}/thread`, posts);
  } else {
    const [post] = posts;
    res = await httpService.post(`${BASE_URL}`, post);
  }
  if (!res) throw new Error("postService: Cannot add post");
  return handleServerResponseData<Post>(res);
}

async function addReply(reply: NewPost): Promise<PostReplyResult> {
  const res = await httpService.post(`${BASE_URL}/reply`, reply);
  return handleServerResponseData<PostReplyResult>(res);
}

async function addRepost(repostedPostId: string): Promise<PostRepostResult> {
  const res = await httpService.post(`${BASE_URL}/${repostedPostId}/repost`);
  return handleServerResponseData<PostRepostResult>(res);
}

async function addQuote(post: NewPost): Promise<Post | PostRepostResult> {
  const res = await httpService.post(`${BASE_URL}/quote`, post);
  return handleServerResponseData<Post | PostRepostResult>(res);
}

async function removeRepost(repostedPostId: string): Promise<Post> {
  const res = await httpService.delete(`${BASE_URL}/${repostedPostId}/repost`);
  return handleServerResponseData<Post>(res);
}

async function update(post: Post) {
  const updatedPost = await httpService.patch(`${BASE_URL}/${post.id}`, post);
  return handleServerResponseData<Post>(updatedPost);
}
async function addPollVote({ postId, optionIdx }: AddPollVoteConfig): Promise<Post> {
  const res = await httpService.post(`${BASE_URL}/poll/${postId}/vote`, { optionIdx });
  return handleServerResponseData<Post>(res);
}

async function addLike(postId: string): Promise<Post> {
  const res = await httpService.post(`${BASE_URL}/${postId}/like`);
  return handleServerResponseData<Post>(res);
}

async function removeLike(postId: string): Promise<Post> {
  const res = await httpService.delete(`${BASE_URL}/${postId}/like`);
  return handleServerResponseData<Post>(res);
}

async function getPostStats(postId: string): Promise<PostStats> {
  const res = await httpService.get(`${BASE_URL}/${postId}/stats`);
  return handleServerResponseData<PostStats>(res);
}

async function addImpression(postId: string): Promise<void> {
  await httpService.post(`${BASE_URL}/${postId}/stats`);
}

async function updatePostStats(postId: string, stats: Partial<PostStatsBody>): Promise<void> {
  await httpService.patch(`${BASE_URL}/${postId}/stats`, stats);
}

async function getBookmarkedPosts(): Promise<Post[]> {
  const res = await httpService.get(`${BASE_URL}/bookmark`);
  return handleServerResponseData<Post[]>(res);
}

async function addBookmark(postId: string): Promise<Post> {
  const res = await httpService.post(`${BASE_URL}/${postId}/bookmark`);
  return handleServerResponseData<Post>(res);
}

async function removeBookmark(postId: string): Promise<Post> {
  const res = await httpService.delete(`${BASE_URL}/${postId}/bookmark`);
  return handleServerResponseData<Post>(res);
}

export default {
  query,
  getById,
  add,
  addReply,
  addRepost,
  addQuote,
  update,
  remove,
  removeRepost,
  addPollVote,
  addLike,
  removeLike,
  getPostStats,
  addImpression,
  updatePostStats,
  getBookmarkedPosts,
  addBookmark,
  removeBookmark,
};
