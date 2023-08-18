import httpService from "./http.service";
import {
  NewPost,
  Post,
  PostReplyResult,
  PostRepostResult,
  PostStats,
  PostStatsBody,
} from "../../../shared/interfaces/post.interface";
import { JsendResponse, UserMsg } from "../../../shared/interfaces/system.interface";
import { handleServerResponse } from "./util/utils.service";

async function query(): Promise<Post[]> {
  const response = await httpService.get(
    "post?sort=-createdAt&previousThreadPostId[exists]=false&limit=51"
  );
  return handleServerResponse<Post[]>(response);
}

async function getById(postId: string): Promise<Post> {
  const response = await httpService.get(`post/${postId}`);
  return handleServerResponse<Post>(response);
}

async function remove(postId: string) {
  await httpService.delete(`post/${postId}`);
}

async function add(posts: NewPost[]): Promise<Post> {
  let res: JsendResponse | null = null;
  if (posts.length > 1) {
    res = await httpService.post("post/thread", posts);
  } else {
    const [post] = posts;
    res = await httpService.post("post", post);
  }
  if (!res) throw new Error("postService: Cannot add post");
  return handleServerResponse<Post>(res);
}

async function addReply(reply: NewPost): Promise<PostReplyResult> {
  const res = await httpService.post("post/reply", reply);
  return handleServerResponse<PostReplyResult>(res);
}

async function addRepost(repostedPost: Post): Promise<PostRepostResult> {
  const res = await httpService.post(`post/repost?postId=${repostedPost.id}`);
  return handleServerResponse<PostRepostResult>(res);
}

async function addQuote(post: NewPost): Promise<Post | PostRepostResult> {
  const res = await httpService.post("post/quote", post);
  return handleServerResponse<Post | PostRepostResult>(res);
}

async function removeRepost(repostedPostId: string): Promise<Post> {
  const res = await httpService.delete(`post/repost?postId=${repostedPostId}`);
  return handleServerResponse<Post>(res);
}

async function update(post: Post) {
  const updatedPost = await httpService.patch(`post/${post.id}`, post);
  return updatedPost;
}
async function savePollVote(postId: string, optionIdx: number) {
  return await httpService.post("post/poll/vote", { postId, optionIdx });
}

async function addLike(postId: string): Promise<Post> {
  const res = await httpService.post(`post/${postId}/like`);
  return handleServerResponse<Post>(res);
}

async function removeLike(postId: string): Promise<Post> {
  const res = await httpService.delete(`post/${postId}/like`);
  return handleServerResponse<Post>(res);
}

async function getPostStats(postId: string): Promise<PostStats> {
  const res = await httpService.get(`post/${postId}/stats`);
  return handleServerResponse<PostStats>(res);
}

async function addImpression(postId: string) {
  await httpService.post(`post/${postId}/stats`);
}

async function updatePostStats(postId: string, stats: Partial<PostStatsBody>) {
  await httpService.patch(`post/${postId}/stats`, stats);
}

async function getBookmarkedPosts(): Promise<Post[]> {
  const res = await httpService.get("post/bookmark");
  return handleServerResponse<Post[]>(res);
}

async function addBookmark(postId: string): Promise<Post> {
  const res = await httpService.post(`post/${postId}/bookmark`);
  return handleServerResponse<Post>(res);
}

async function removeBookmark(postId: string): Promise<Post> {
  const res = await httpService.delete(`post/${postId}/bookmark`);
  return handleServerResponse<Post>(res);
}

const getPostAddedMsg = ({ postId, date }: { postId: string; date?: Date }): UserMsg => {
  let text = "Your Chirp has been sent!";

  if (date) {
    const dateStr = new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date);

    text = `Your Chirp will be sent on ${dateStr}`;
  }

  return {
    type: "info",
    text,
    link: `/post/${postId}`,
  };
};

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
  savePollVote,
  addLike,
  removeLike,
  getPostStats,
  addImpression,
  updatePostStats,
  getBookmarkedPosts,
  addBookmark,
  removeBookmark,
  getPostAddedMsg,
};
