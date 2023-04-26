import { httpService } from "./http.service";
import { NewPost, Post } from "../../../shared/interfaces/post.interface";

export const postService = {
  query,
  getById,
  remove,
  add,
  update,
};

async function query(): Promise<Post[] | void> {
  try {
    const posts = await httpService.get("post");
    return posts;
  } catch (err) {
    console.log("postService: Cannot get posts");
    throw err;
  }
}

async function getById(postId: string) {
  try {
    const post = await httpService.get(`post/${postId}`);
    return post;
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

async function add(post: NewPost): Promise<Post> {
  try {
    const addedPost = await httpService.post("post", post);
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
