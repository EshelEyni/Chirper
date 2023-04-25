import { httpService } from "./http.service";
import { NewPost, Post } from "../../../shared/interfaces/post.interface";
import { Gif, GifCategory } from "../../../shared/interfaces/gif.interface";

export const postService = {
  query,
  getById,
  remove,
  add,
  update,
  getGifsBySearchTerm,
  getGifCategroies,
  getGifByCategory,
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

async function getGifsBySearchTerm(searchTerm: string): Promise<Gif[]> {
  try {
    const gifs = await httpService.get(`gif/search?searchTerm=${searchTerm}`);
    return gifs as Gif[];
  } catch (err) {
    console.log("gifService: Cannot get gifs");
    throw err;
  }
}

async function getGifCategroies(): Promise<GifCategory[]> {
  try {
    const gifs = await httpService.get(`gif/categories`);
    return gifs as GifCategory[];
  } catch (err) {
    console.log("gifService: Cannot get gifs");
    throw err;
  }
}

async function getGifByCategory(category: string): Promise<Gif[]> {
  try {
    const gifs = await httpService.get(`gif/category/${category}`);
    return gifs as Gif[];
  } catch (err) {
    console.log("gifService: Cannot get gifs");
    throw err;
  }
}
