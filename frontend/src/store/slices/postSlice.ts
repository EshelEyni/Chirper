import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NewPost, Post, PostRepostResult } from "../../../../shared/interfaces/post.interface";
import { AppThunk } from "../store";
import postService from "../../services/post.service";
import { displayUserMsg } from "./systemSlice";
import userService from "../../services/user.service";

interface PostState {
  posts: Post[];
  post: Post | null;
}

const initialState: PostState = {
  posts: [],
  post: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    setPost: (state, action: PayloadAction<Post | null>) => {
      state.post = action.payload;
    },
    removePost: (state, action: PayloadAction<{ postId: string }>) => {
      state.posts = state.posts.filter(post => post.id !== action.payload.postId);
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts = [action.payload, ...state.posts];
    },
    addReply: (state, action: PayloadAction<{ reply: Post; post: Post }>) => {
      state.posts = [
        action.payload.reply,
        ...state.posts.map(post =>
          post.id === action.payload.post.id ? action.payload.post : post
        ),
      ];
    },
    addRepost: (state, action: PayloadAction<{ repost: Post; post: Post }>) => {
      state.posts = [
        action.payload.repost,
        ...state.posts.map(post =>
          post.id === action.payload.post.id ? action.payload.post : post
        ),
      ];
    },
    removeRepost: (state, action: PayloadAction<{ post: Post; loggedInUserId: string }>) => {
      state.posts = state.posts
        .filter(
          post =>
            post.id !== action.payload.post.id ||
            !(post.repostedBy && post.repostedBy.id === action.payload.loggedInUserId)
        )
        .map(post => (post.id === action.payload.post.id ? action.payload.post : post));
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      state.posts = state.posts.map(post =>
        post.id === action.payload.id ? action.payload : post
      );
      if (state.post && state.post.id === action.payload.id) state.post = action.payload;
    },
  },
});

export const {
  setPosts,
  setPost,
  removePost,
  addPost,
  addReply,
  addRepost,
  removeRepost,
  updatePost,
} = postSlice.actions;

export default postSlice.reducer;

export function getPosts(): AppThunk {
  return async dispatch => {
    try {
      const posts = await postService.query();
      dispatch(setPosts(posts));
    } catch (err) {
      dispatch(_displayErrorMsg("Couldn't get posts. Please try again later."));
      console.log("PostActions: err in getPosts", err);
    }
  };
}

export function getPost(postId: string): AppThunk {
  return async dispatch => {
    try {
      const post = await postService.getById(postId);
      dispatch(setPost(post));
    } catch (err) {
      dispatch(_displayErrorMsg("Couldn't get post. Please try again later."));
      console.log("PostActions: err in getPost", err);
    }
  };
}

export function removePostAsync(postId: string): AppThunk {
  return async dispatch => {
    try {
      await postService.remove(postId);
      dispatch(removePost({ postId }));
      dispatch(
        displayUserMsg({
          type: "info",
          text: "Your Chirp has been deleted",
        })
      );
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in removePost", err);
    }
  };
}

export function addPostAsync(posts: NewPost[]): AppThunk {
  return async dispatch => {
    try {
      const addedPost = await postService.add(posts);
      dispatch(addPost(addedPost));

      const msg = postService.getPostAddedMsg({
        postId: addedPost.id,
        date: addedPost.schedule,
      });
      dispatch(displayUserMsg(msg));
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in addPost", err);
    }
  };
}

export function updatePostAsync(post: Post): AppThunk {
  return async dispatch => {
    try {
      const updatedPost = await postService.update(post);
      dispatch(updatePost(updatedPost));
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in updatePost", err);
    }
  };
}

export function addReplyAsync(post: NewPost): AppThunk {
  return async dispatch => {
    try {
      const { updatedPost, reply } = await postService.addReply(post);
      dispatch(addReply({ reply, post: updatedPost }));
      dispatch(
        displayUserMsg({
          type: "info",
          text: "Your Chirp has been sent!",
          link: `/post/${reply.id}`,
        })
      );
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in addReply", err);
    }
  };
}

export function addRepostAsync(post: Post): AppThunk {
  return async dispatch => {
    try {
      const { updatedPost, repost } = await postService.addRepost(post);
      dispatch(addRepost({ repost, post: updatedPost }));
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in repostPost", err);
    }
  };
}

export function addQuotePost(post: NewPost): AppThunk {
  return async dispatch => {
    try {
      const data = await postService.addQuote(post);
      const isRepost = "updatedPost" in data && "repost" in data;

      if (isRepost) {
        const { updatedPost, repost } = data as PostRepostResult;
        dispatch(addRepost({ repost, post: updatedPost }));
      } else {
        const addedPost = data as Post;
        dispatch(addPost(addedPost));
        dispatch(
          displayUserMsg({
            type: "info",
            text: "Your Chirp has been sent!",
            link: `/post/${addedPost.id}`,
          })
        );
      }
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in quotePost", err);
    }
  };
}

export function removeRepostAsync(postId: string, loggedInUserId: string): AppThunk {
  return async dispatch => {
    try {
      const updatedPost = await postService.removeRepost(postId);
      dispatch(removeRepost({ post: updatedPost, loggedInUserId }));
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in removeRepost", err);
    }
  };
}

export function addLike(postId: string): AppThunk {
  return async dispatch => {
    try {
      const updatedPost = await postService.addLike(postId);
      dispatch(updatePost(updatedPost));
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in likePost", err);
    }
  };
}

export function removeLike(postId: string): AppThunk {
  return async dispatch => {
    try {
      const updatedPost = await postService.removeLike(postId);
      dispatch(updatePost(updatedPost));
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in removeLike", err);
    }
  };
}

export function addBookmark(postId: string): AppThunk {
  return async dispatch => {
    try {
      const updatedPost = await postService.addBookmark(postId);
      dispatch(updatePost(updatedPost));
      dispatch(
        displayUserMsg({
          type: "info",
          text: "Chirp added to your Bookmarks",
          link: "/bookmarks",
        })
      );
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in likePost", err);
    }
  };
}

export function removeBookmark(postId: string): AppThunk {
  return async dispatch => {
    try {
      const updatedPost = await postService.removeBookmark(postId);
      dispatch(updatePost(updatedPost));
      dispatch(
        displayUserMsg({
          type: "info",
          text: "Chirp removed from your Bookmarks",
          link: "/bookmarks",
        })
      );
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in removeBookmark", err);
    }
  };
}

export function addFollowFromPost(userId: string, postId: string): AppThunk {
  return async dispatch => {
    try {
      const updatedPost = await userService.followUser(userId, postId);
      dispatch(updatePost(updatedPost as Post));
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in addFollowFromPost", err);
    }
  };
}

export function removeFollowFromPost(userId: string, postId: string): AppThunk {
  return async dispatch => {
    try {
      const updatedPost = await userService.unFollowUser(userId, postId);
      dispatch(updatePost(updatedPost as Post));
    } catch (err) {
      dispatch(_displayErrorMsg());
      console.log("PostActions: err in removeFollowFromPost", err);
    }
  };
}

const defaultErrorMsg = "Something went wrong, but don’t fret — let’s give it another shot.";

function _displayErrorMsg(text = defaultErrorMsg) {
  return displayUserMsg({
    type: "error",
    text,
  });
}
