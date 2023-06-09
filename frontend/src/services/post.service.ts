import { httpService } from "./http.service";
import { AddPostParams, Post } from "../../../shared/interfaces/post.interface";
import { utilService } from "./util.service/utils.service";
import { JsendResponse } from "../../../shared/interfaces/system.interface";

export const postService = {
  query,
  getById,
  remove,
  add,
  update,
  savePollVote,
};

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
    const response = await httpService.delete(`post/${postId}`);
    console.log(response);
  } catch (err) {
    console.log("postService: Cannot remove post");
    throw err;
  }
}

async function add({ posts, repostedPost }: AddPostParams): Promise<Post> {
  try {
    let res: JsendResponse | null = null;
    if (posts) {
      if (posts.length > 1) {
        res = await httpService.post("post/thread", posts);
      } else {
        const post = posts[0];
        res = await httpService.post("post", post);
      }
    } else if (repostedPost) {
      res = await httpService.post(`post/repost?postId=${repostedPost.id}`);
    }
    if (!res) throw new Error("postService: Cannot add post");
    return utilService.handleServerResponse<Post>(res);
  } catch (err) {
    console.log("postService: Cannot add post");
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
