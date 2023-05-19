import { httpService } from "./http.service";
import { NewPost, Post } from "../../../shared/interfaces/post.interface";
import { JsendResponse } from "../../../shared/interfaces/system.interface";
import { utilService } from "./util.service/utils.service";

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
    const response = (await httpService.get("post?limit=10&page=1")) as unknown as JsendResponse;
    return utilService.handleServerResponse<Post[]>(response);
  } catch (err) {
    console.log("postService: Cannot get posts");
    throw err;
  }
}

async function getById(postId: string): Promise<Post> {
  try {
    const response = (await httpService.get(`post/${postId}`)) as unknown as JsendResponse;
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

async function add(post: NewPost): Promise<Post> {
  try {
    const res = (await httpService.post("post", post)) as unknown as JsendResponse;
    const addedPost = res.data;
    return addedPost;
  } catch (err) {
    console.log("postService: Cannot add post");
    throw err;
  }
}

async function update(post: Post) {
  try {
    const updatedPost = await httpService.put(`post/${post.id}`, post);
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
