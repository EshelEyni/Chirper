import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import postService from "../../services/post.service";
import { RootState } from "../store";
import { NewPost, Post } from "../../../../shared/interfaces/post.interface";
// import { setUserMsg } from "./system.actions";
import { PostRepostResult } from "../../../../shared/interfaces/post.interface";
import userService from "../../services/user.service";
import { setUserMsg } from "../slices/systemSlice";

export function getPosts(): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const posts = await postService.query();
      dispatch({ type: "SET_POSTS", posts });
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Cannot load posts, please try again later",
        })
      );
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
      dispatch(
        setUserMsg({
          type: "error",
          text: "Cannot load post, please try again later",
        })
      );
      console.log("PostActions: err in getPost", err);
    }
  };
}

export function clearPost(): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      dispatch({ type: "SET_POST", post: null });
    } catch (err) {
      console.log("PostActions: err in clearPost", err);
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
      dispatch(
        setUserMsg({
          type: "info",
          text: "Your Chirp has been deleted",
        })
      );
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in removePost", err);
    }
  };
}

export function addPost(
  posts: NewPost[]
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const addedPost = await postService.add(posts);
      dispatch({ type: "ADD_POST", post: addedPost });

      const msg = postService.getPostAddedMsg({
        postId: addedPost.id,
        date: addedPost.schedule,
      });
      dispatch(setUserMsg(msg));
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
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
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in updatePost", err);
    }
  };
}

export function addReply(
  post: NewPost
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const { updatedPost, reply } = await postService.addReply(post);
      dispatch({ type: "ADD_REPLY", post: updatedPost, reply });
      dispatch(
        setUserMsg({
          type: "info",
          text: "Your Chirp has been sent!",
          link: `/post/${reply.id}`,
        })
      );
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in addReply", err);
    }
  };
}

export function repostPost(
  post: Post
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const { updatedPost, repost } = await postService.addRepost(post);
      dispatch({ type: "ADD_REPOST", post: updatedPost, repost });
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in repostPost", err);
    }
  };
}

export function addQuotePost(
  post: NewPost
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const data = await postService.addQuote(post);
      const isRepost = "updatedPost" in data && "repost" in data;

      if (isRepost) {
        const { updatedPost, repost } = data as PostRepostResult;
        dispatch({ type: "ADD_REPOST", post: updatedPost, repost });
      } else {
        const addedPost = data as Post;
        dispatch({ type: "ADD_POST", post: addedPost });
        dispatch(
          setUserMsg({
            type: "info",
            text: "Your Chirp has been sent!",
            link: `/post/${addedPost.id}`,
          })
        );
      }
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in quotePost", err);
    }
  };
}

export function removeRepost(
  postId: string,
  loggedInUserId: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const updatedPost = await postService.removeRepost(postId);
      dispatch({ type: "REMOVE_REPOST", post: updatedPost, loggedInUserId });
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in removeRepost", err);
    }
  };
}

export function addLike(
  postId: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const updatedPost = await postService.addLike(postId);
      dispatch({ type: "UPDATE_POST", updatedPost });
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in likePost", err);
    }
  };
}

export function removeLike(
  postId: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const updatedPost = await postService.removeLike(postId);
      dispatch({ type: "UPDATE_POST", updatedPost });
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in removeLike", err);
    }
  };
}

export function addBookmark(
  postId: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const updatedPost = await postService.addBookmark(postId);
      dispatch({ type: "UPDATE_POST", updatedPost });
      dispatch(
        setUserMsg({
          type: "info",
          text: "Chirp added to your Bookmarks",
          link: "/bookmarks",
        })
      );
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in likePost", err);
    }
  };
}

export function removeBookmark(
  postId: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const updatedPost = await postService.removeBookmark(postId);
      dispatch({ type: "UPDATE_POST", updatedPost });
      dispatch(
        setUserMsg({
          type: "info",
          text: "Chirp removed from your Bookmarks",
          link: "/bookmarks",
        })
      );
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in removeBookmark", err);
    }
  };
}

export function addFollowFromPost(
  userId: string,
  postId: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const updatedPost = await userService.followUser(userId, postId);
      dispatch({ type: "UPDATE_POST", updatedPost });
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in addFollowFromPost", err);
    }
  };
}

export function removeFollowFromPost(
  userId: string,
  postId: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const updatedPost = await userService.unFollowUser(userId, postId);
      dispatch({ type: "UPDATE_POST", updatedPost });
    } catch (err) {
      dispatch(
        setUserMsg({
          type: "error",
          text: "Something went wrong, but don’t fret — let’s give it another shot.",
        })
      );
      console.log("PostActions: err in removeFollowFromPost", err);
    }
  };
}
