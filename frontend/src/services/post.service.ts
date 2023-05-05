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
};

async function query(): Promise<Post[]> {
  try {
    const response = (await httpService.get("post")) as unknown as JsendResponse;
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
    const updatedPost = await httpService.put(`post/${post._id}`, post);
    return updatedPost;
  } catch (err) {
    console.log("postService: Cannot update post");
    throw err;
  }
}
