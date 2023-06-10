import { httpService } from "./http.service";
import { NewPost, Post } from "../../../shared/interfaces/post.interface";
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
        const post = posts[0];
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

async function addRepost(repostedPost: Post): Promise<Post> {
  try {
    const res = await httpService.post(`post/repost?postId=${repostedPost.id}`);
    return utilService.handleServerResponse<Post>(res);
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

async function removeRepost(repostedPost: Post): Promise<void> {
  try {
    await httpService.delete(`post/repost?postId=${repostedPost.id}`);
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

async function addLike(postId: string) {
  try {
    return await httpService.post(`post/${postId}/like`);
  } catch (err) {
    console.log("postService: Cannot add like", err);
  }
}

async function removeLike(postId: string) {
  try {
    return await httpService.delete(`post/${postId}/like`);
  } catch (err) {
    console.log("postService: Cannot remove like", err);
  }
}

export const postService = {
  query,
  getById,
  add,
  addRepost,
  addQuote,
  update,
  remove,
  removeRepost,
  savePollVote,
  addLike,
  removeLike,
};
