import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { postService } from "../../services/post.service";
import { RootState } from "../store";
import { NewPost, Post } from "../../../../shared/interfaces/post.interface";

export function getPosts(): ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  AnyAction
> {
  return async (dispatch) => {
    try {
      const posts = await postService.query();
      console.log("PostActions: posts", posts);
      dispatch({ type: "SET_POSTS", posts });
    } catch (err) {
      console.log("PostActions: err in getPosts", err);
    }
  };
}

export function getPost(
  postId: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async (dispatch) => {
    try {
      const post = await postService.getById(postId);
      dispatch({ type: "SET_POST", post });
    } catch (err) {
      console.log("PostActions: err in getPost", err);
    }
  };
}

export function removePost(
  postId: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async (dispatch) => {
    try {
      await postService.remove(postId);
      dispatch({ type: "REMOVE_POST", postId });
    } catch (err) {
      console.log("PostActions: err in removePost", err);
    }
  };
}

export function addPost(
  post: NewPost
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async (dispatch) => {
    try {
      const addedPost = await postService.add(post);
      dispatch({ type: "ADD_POST", post: addedPost });
    } catch (err) {
      console.log("PostActions: err in addPost", err);
    }
  };
}


export function updatePost(
  post: Post
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async (dispatch) => {
    try {
      const updatedPost = await postService.update(post);
      dispatch({ type: "UPDATE_POST", updatedPost });
    } catch (err) {
      console.log("PostActions: err in updatePost", err);
    }
  };
}
