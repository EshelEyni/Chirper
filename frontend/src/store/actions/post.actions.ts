import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { postService } from "../../services/post.service";
import { RootState } from "../store";
import { NewPost, Post } from "../../../../shared/interfaces/post.interface";
import { UserMsg } from "../../../../shared/interfaces/system.interface";
import { NewPostType } from "../reducers/post.reducer";

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
  post: NewPost
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const addedPost = await postService.add(post);
      const isPublished = !post.schedule;
      if (isPublished) {
        dispatch({ type: "ADD_POST", post: addedPost });
      } else {
        const dateStr = new Intl.DateTimeFormat("en-US", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "UTC",
        }).format(post.schedule);

        const msg: UserMsg = {
          type: "info",
          text: `Your Chirp will be sent on ${dateStr}`,
        };
        dispatch({ type: "SET_USER_MSG", userMsg: msg });
        setTimeout(() => {
          dispatch({ type: "SET_USER_MSG", userMsg: null });
        }, 2000);
      }
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

export function setNewPost(
  newPost: NewPost,
  newPostType: NewPostType
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      if (newPostType === "post") {
        dispatch({ type: "SET_NEW_POST", newPost });
      } else {
        dispatch({ type: "SET_SIDEBAR_NEW_POST", newPost });
      }
    } catch (err) {
      console.log("PostActions: err in setNewPost", err);
    }
  };
}

export function clearNewPost(
  newPostType: NewPostType
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      if (newPostType === "post") {
        dispatch({ type: "CLEAR_NEW_POST" });
      } else {
        dispatch({ type: "CLEAR_SIDEBAR_NEW_POST" });
      }
    } catch (err) {
      console.log("PostActions: err in clearNewPost", err);
    }
  };
}

export function setNewPostType(
  newPostType: NewPostType
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      dispatch({ type: "SET_NEW_POST_TYPE", newPostType });
    } catch (err) {
      console.log("PostActions: err in setNewPostType", err);
    }
  };
}
