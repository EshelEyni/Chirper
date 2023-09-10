import httpService from "./http/httpService";
import {
  AnyPost,
  NewPost,
  Post,
  PostReplyResult,
  PostRepostResult,
  PostStats,
  PostStatsBody,
  PromotionalPost,
  Repost,
} from "../../../shared/types/post.interface";
import { JsendResponse, UserMsg } from "../../../shared/types/system.interface";
import { handleServerResponse } from "./util/utilService";
import qs from "qs";

type AddPollVoteConfig = {
  postId: string;
  optionIdx: number;
};

const BASE_URL = "post";

async function query(queryObj?: any): Promise<Post[]> {
  const queryString = queryObj ? "&" + qs.stringify(queryObj) : "";
  const response = await httpService.get(
    `${BASE_URL}?sort=-createdAt&parentPostId[exists]=false&limit=35${queryString}`
  );

  return handleServerResponse<Post[]>(response);
}

async function getById(postId: string): Promise<Post> {
  const response = await httpService.get(`${BASE_URL}/${postId}`);
  return handleServerResponse<Post>(response);
}

async function remove(postId: string) {
  await httpService.delete(`${BASE_URL}/${postId}`);
}

async function add(posts: NewPost[]): Promise<Post> {
  let res: JsendResponse | null = null;
  if (posts.length > 1) {
    res = await httpService.post(`${BASE_URL}/thread`, posts);
  } else {
    const [post] = posts;
    res = await httpService.post(`${BASE_URL}`, post);
  }
  if (!res) throw new Error("postService: Cannot add post");
  return handleServerResponse<Post>(res);
}

async function addReply(reply: NewPost): Promise<PostReplyResult> {
  const res = await httpService.post(`${BASE_URL}/reply`, reply);
  return handleServerResponse<PostReplyResult>(res);
}

async function addRepost(repostedPost: Post): Promise<PostRepostResult> {
  const res = await httpService.post(`${BASE_URL}/${repostedPost.id}/repost`);
  return handleServerResponse<PostRepostResult>(res);
}

async function addQuote(post: NewPost): Promise<Post | PostRepostResult> {
  const res = await httpService.post(`${BASE_URL}/quote`, post);
  return handleServerResponse<Post | PostRepostResult>(res);
}

async function removeRepost(repostedPostId: string): Promise<Post> {
  const res = await httpService.delete(`${BASE_URL}/${repostedPostId}/repost`);
  return handleServerResponse<Post>(res);
}

async function update(post: Post) {
  const updatedPost = await httpService.patch(`${BASE_URL}/${post.id}`, post);
  return handleServerResponse<Post>(updatedPost);
}
async function addPollVote({ postId, optionIdx }: AddPollVoteConfig): Promise<Post> {
  const res = await httpService.post(`${BASE_URL}/poll/${postId}/vote`, { optionIdx });
  return handleServerResponse<Post>(res);
}

async function addLike(postId: string): Promise<Post> {
  const res = await httpService.post(`${BASE_URL}/${postId}/like`);
  return handleServerResponse<Post>(res);
}

async function removeLike(postId: string): Promise<Post> {
  const res = await httpService.delete(`${BASE_URL}/${postId}/like`);
  return handleServerResponse<Post>(res);
}

async function getPostStats(postId: string): Promise<PostStats> {
  const res = await httpService.get(`${BASE_URL}/${postId}/stats`);
  return handleServerResponse<PostStats>(res);
}

async function addImpression(postId: string): Promise<void> {
  httpService.post(`${BASE_URL}/${postId}/stats`);
}

async function updatePostStats(postId: string, stats: Partial<PostStatsBody>): Promise<void> {
  httpService.patch(`${BASE_URL}/${postId}/stats`, stats);
}

async function getBookmarkedPosts(): Promise<Post[]> {
  const res = await httpService.get(`${BASE_URL}/bookmark`);
  return handleServerResponse<Post[]>(res);
}

async function addBookmark(postId: string): Promise<Post> {
  const res = await httpService.post(`${BASE_URL}/${postId}/bookmark`);
  return handleServerResponse<Post>(res);
}

async function removeBookmark(postId: string): Promise<Post> {
  const res = await httpService.delete(`${BASE_URL}/${postId}/bookmark`);
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
    link: { url: `/post/${postId}` },
  };
};

/*  
newPostText is the text of the new post from the textarea, that has own state,
due to the fact that we don't want to dispatch to redux store on every keystroke
*/

function checkPostValidity(post: NewPost | null, newPostText: string): boolean {
  const checkPostTextValidity = (text: string): boolean =>
    !!text && text.length > 0 && text.length <= 247;

  const checkPostPollValidity = (post: NewPost): boolean =>
    post.poll!.options.every(option => option.text.length > 0);

  if (!post) return false;
  if (post.poll) return checkPostPollValidity(post) && checkPostTextValidity(newPostText);
  return (
    checkPostTextValidity(newPostText) ||
    post.imgs.length > 0 ||
    !!post.gif ||
    !!post.video ||
    !!post.quotedPostId
  );
}

function checkPostArrayValidity(newPosts: NewPost[], newPostText: string): boolean {
  return newPosts.every(post => checkPostValidity(post, newPostText));
}

function isPost(post: AnyPost): post is Post {
  return "createdBy" in post;
}

function isRepost(post: AnyPost): post is Repost {
  return "repostedBy" in post;
}
function isPromotionalPost(post: AnyPost): post is PromotionalPost {
  return "companyName" in post;
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
  getPostAddedMsg,
  checkPostValidity,
  checkPostArrayValidity,
  isRepost,
  isPromotionalPost,
  isPost,
};
