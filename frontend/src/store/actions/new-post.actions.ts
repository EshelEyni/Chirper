import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { RootState } from "../store";
import { NewPost, Post } from "../../../../shared/interfaces/post.interface";
import { NewPostType } from "../reducers/new-post.reducer";

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

export function setNewPosts(
  newPosts: NewPost[],
  newPostType: NewPostType,
  repliedToPost?: Post
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      if (newPostType !== "reply") {
        dispatch({ type: "SET_NEW_POSTS", newPosts, newPostType });
      } else {
        dispatch({ type: "SET_NEW_POSTS", repliedToPost, newPostType });
      }
    } catch (err) {
      console.log("PostActions: err in setNewPosts", err);
    }
  };
}

export function setNewPost(
  newPost: NewPost,
  newPostType: NewPostType
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      dispatch({ type: "SET_NEW_POST", newPost, newPostType });
    } catch (err) {
      console.log("PostActions: err in setCurrNewPost", err);
    }
  };
}

export function addNewPostToThread(
  newPostType: NewPostType
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      dispatch({ type: "ADD_NEW_POST", newPostType });
    } catch (err) {
      console.log("PostActions: err in addNewPost", err);
    }
  };
}

export function updateCurrNewPost(
  newPost: NewPost,
  newPostType: NewPostType
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      dispatch({ type: "UPDATE_NEW_POST", newPost, newPostType });
    } catch (err) {
      console.log("PostActions: err in updateCurrNewPost", err);
    }
  };
}

export function removeNewPostFromThread(
  newPostType: NewPostType
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      dispatch({ type: "REMOVE_NEW_POST", newPostType });
    } catch (err) {
      console.log("PostActions: err in removeNewPost", err);
    }
  };
}
