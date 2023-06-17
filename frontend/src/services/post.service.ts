import { httpService } from "./http.service";
import {
  NewPost,
  Post,
  PostReplyResult,
  PostRepostResult,
  PostStats,
  PostStatsBody,
} from "../../../shared/interfaces/post.interface";
import { utilService } from "./util.service/utils.service";
import { JsendResponse } from "../../../shared/interfaces/system.interface";

async function query(): Promise<Post[]> {
  try {
    const response = await httpService.get(
      "post?sort=-createdAt&previousThreadPostId[exists]=false"
    );
    return utilService.handleServerResponse<Post[]>(response);
  } catch (err) {
    console.log("postService: Cannot get posts");
    throw err;
  }
}

async function getById(postId: string): Promise<Post> {
  try {
    const response = await httpService.get(`post/${postId}`);
    return utilService.handleServerResponse<Post>(response);
  } catch (err) {
    console.log("postService: Cannot get post");
    throw err;
  }
}

async function remove(postId: string) {
  try {
    await httpService.delete(`post/${postId}`);
  } catch (err) {
    console.log("postService: Cannot remove post");
    throw err;
  }
}

async function add(posts: NewPost[]): Promise<Post> {
  try {
    let res: JsendResponse | null = null;
    if (posts) {
      if (posts.length > 1) {
        res = await httpService.post("post/thread", posts);
      } else {
        const [post] = posts;
        res = await httpService.post("post", post);
      }
    }
    if (!res) throw new Error("postService: Cannot add post");
    return utilService.handleServerResponse<Post>(res);
  } catch (err) {
    console.log("postService: Cannot add post");
    throw err;
  }
}

async function addReply(reply: NewPost): Promise<PostReplyResult> {
  try {
    const res = await httpService.post("post/reply", reply);
    return utilService.handleServerResponse<PostReplyResult>(res);
  } catch (err) {
    console.log("postService: Cannot add reply");
    throw err;
  }
}

async function addRepost(repostedPost: Post): Promise<PostRepostResult> {
  try {
    const res = await httpService.post(`post/repost?postId=${repostedPost.id}`);
    return utilService.handleServerResponse<PostRepostResult>(res);
  } catch (err) {
    console.log("postService: Cannot add repost");
    throw err;
  }
}

async function addQuote(post: NewPost): Promise<Post> {
  try {
    const res = await httpService.post("post/quote", post);
    return utilService.handleServerResponse<Post>(res);
  } catch (err) {
    console.log("postService: Cannot add quote");
    throw err;
  }
}

async function removeRepost(repostedPostId: string): Promise<Post> {
  try {
    const res = await httpService.delete(`post/repost?postId=${repostedPostId}`);
    return utilService.handleServerResponse<Post>(res);
  } catch (err) {
    console.log("postService: Cannot remove repost");
    throw err;
  }
}

async function update(post: Post) {
  try {
    const updatedPost = await httpService.patch(`post/${post.id}`, post);
    return updatedPost;
  } catch (err) {
    console.log("postService: Cannot update post");
    throw err;
  }
}

async function savePollVote(postId: string, optionIdx: number) {
  try {
    return await httpService.post("post/poll/vote", { postId, optionIdx });
  } catch (err) {
    console.log("postService: Cannot save poll vote", err);
  }
}

async function addLike(postId: string): Promise<Post> {
  try {
    const res = await httpService.post(`post/${postId}/like`);
    return utilService.handleServerResponse<Post>(res);
  } catch (err) {
    console.log("postService: Cannot add like", err);
    throw err;
  }
}

async function removeLike(postId: string): Promise<Post> {
  try {
    const res = await httpService.delete(`post/${postId}/like`);
    return utilService.handleServerResponse<Post>(res);
  } catch (err) {
    console.log("postService: Cannot remove like", err);
    throw err;
  }
}

async function addImpression(postId: string) {
  try {
    await httpService.post(`post/${postId}/stats`);
  } catch (err) {
    console.log("postService: Cannot add impression", err);
    throw err;
  }
}

async function updatePostStats(postId: string, stats: Partial<PostStatsBody>) {
  try {
    await httpService.patch(`post/${postId}/stats`, stats);
  } catch (err) {
    console.log("postService: Cannot update post stats", err);
    throw err;
  }
}

async function getPostStats(postId: string): Promise<PostStats> {
  try {
    const res = await httpService.get(`post/${postId}/stats`);
    return utilService.handleServerResponse<PostStats>(res);
  } catch (err) {
    console.log("postService: Cannot get post stats", err);
    throw err;
  }
}

function formatPostText(text: string): string {
  const urls = text.match(/(https?:\/\/[^\s]+)/g);
  const urlsSet = new Set(urls);
  let formmatedText = text;
  if (urlsSet) {
    urlsSet.forEach(url => {
      const trimmedUrl = url.replace("https://www.", "");
      formmatedText = formmatedText.replaceAll(
        url,
        `<a href="${url}" data-type="external-link">${trimmedUrl}</a>`
      );
    });
  }

  const hashtags = text.match(/(^|\s)(#[^\s]+)/g);
  const hashtagsSet = new Set(hashtags);
  if (hashtagsSet) {
    hashtagsSet.forEach(hashtag => {
      formmatedText = formmatedText.replaceAll(
        hashtag,
        `<a data-url="${hashtag.slice(1)}" data-type="hashtag">${hashtag}</a>`
      );
    });
  }

  const mentions = text.match(/@[^\s]+/g);
  if (mentions) {
    mentions.forEach(mention => {
      formmatedText = formmatedText.replaceAll(
        mention,
        `<a href="/${mention.slice(1)}" data-type="profile-link">${mention}</a>`
      );
    });
  }

  const lineBreaks = formmatedText.match(/\n/g);
  if (lineBreaks) {
    formmatedText = formmatedText.replaceAll("\n", "<br />");
  }

  return formmatedText;
}

export const postService = {
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
  formatPostText,
};
