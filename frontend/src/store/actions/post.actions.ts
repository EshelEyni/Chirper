import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { postService } from "../../services/post.service";
import { RootState } from "../store";
import { AddPostParams, NewPost, Post } from "../../../../shared/interfaces/post.interface";
import { UserMsg } from "../../../../shared/interfaces/system.interface";

export function getPosts(): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const posts = await postService.query();
      dispatch({ type: "SET_POSTS", posts });
    } catch (err) {
      console.log("PostActions: err in getPosts", err);
    }
  };
}

export function updatePosts(
  posts: Post[]
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      dispatch({ type: "UPDATE_POSTS", posts });
    } catch (err) {
      console.log("PostActions: err in updatePosts", err);
    }
  };
}

export function getPost(
  postId: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
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
  return async dispatch => {
    try {
      await postService.remove(postId);
      dispatch({ type: "REMOVE_POST", postId });
    } catch (err) {
      console.log("PostActions: err in removePost", err);
    }
  };
}

export function addPost(
  posts: NewPost[]
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const addedPost = await postService.add({ posts });
      // const isPublished = !addedPost.schedule;
      // if (!isPublished) {
      //   const dateStr = new Intl.DateTimeFormat("en-US", {
      //     dateStyle: "full",
      //     timeStyle: "short",
      //     timeZone: "UTC",
      //   }).format(addedPost.schedule);

      //   const msg: UserMsg = {
      //     type: "info",
      //     text: `Your Chirp will be sent on ${dateStr}`,
      //   };
      //   dispatch({ type: "SET_USER_MSG", userMsg: msg });
      //   setTimeout(() => {
      //     dispatch({ type: "SET_USER_MSG", userMsg: null });
      //   }, 2000);
      // }
      dispatch({ type: "ADD_POST", post: addedPost });
    } catch (err) {
      const msg: UserMsg = {
        type: "error",
        text: "Something went wrong, but don’t fret — let’s give it another shot.",
      };
      dispatch({ type: "SET_USER_MSG", userMsg: msg });
      setTimeout(() => {
        dispatch({ type: "SET_USER_MSG", userMsg: null });
      }, 2000);
      console.log("PostActions: err in addPost", err);
    }
  };
}

export function repostPost(
  repostedPost: Post
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const addedPost = await postService.add({ repostedPost });
      dispatch({ type: "ADD_REPOST", post: addedPost });
    } catch (err) {
      console.log("PostActions: err in repostPost", err);
    }
  };
}

export function updatePost(
  post: Post
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const updatedPost = await postService.update(post);
      dispatch({ type: "UPDATE_POST", updatedPost });
    } catch (err) {
      console.log("PostActions: err in updatePost", err);
    }
  };
}
