import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NewPost, Post } from "../../../../shared/types/post";
import { NewPostType } from "../../types/Enums";
import postUtilService from "../../services/post/postUtilService";

type NewPostState = {
  homePage: {
    posts: NewPost[];
    currPostIdx: number;
  };
  sideBar: {
    posts: NewPost[];
    currPostIdx: number;
  };
  reply: {
    repliedToPost: Post | null;
    reply: NewPost | null;
  };
  quote: {
    quotedPost: Post | null;
    quote: NewPost | null;
  };
  newPostType: NewPostType;
};

const initialState: NewPostState = {
  homePage: {
    posts: [postUtilService.getDefaultNewPost()],
    currPostIdx: 0,
  },
  sideBar: {
    posts: [postUtilService.getDefaultNewPost()],
    currPostIdx: 0,
  },
  reply: {
    repliedToPost: null,
    reply: null,
  },
  quote: {
    quotedPost: null,
    quote: null,
  },
  newPostType: NewPostType.HomePage,
};

const postEditSlice = createSlice({
  name: "postEdit",
  initialState,
  reducers: {
    setNewPostType(state, action: PayloadAction<NewPostType>) {
      state.newPostType = action.payload;
    },
    setNewHomePosts(state, action: PayloadAction<{ newPosts: NewPost[] }>) {
      state.newPostType = NewPostType.HomePage;
      state.homePage = {
        posts: action.payload.newPosts,
        currPostIdx: 0,
      };
    },
    clearNewHomePosts(state) {
      state.homePage = {
        posts: [postUtilService.getDefaultNewPost()],
        currPostIdx: 0,
      };
    },
    setNewSideBarPosts(state, action: PayloadAction<{ newPosts: NewPost[] }>) {
      state.newPostType = NewPostType.SideBar;
      state.sideBar = {
        posts: action.payload.newPosts,
        currPostIdx: 0,
      };
    },
    clearNewSideBarPosts(state) {
      state.sideBar = {
        posts: [postUtilService.getDefaultNewPost()],
        currPostIdx: 0,
      };
    },
    setNewReply(state, action: PayloadAction<{ repliedToPost: Post }>) {
      state.newPostType = NewPostType.Reply;
      state.reply = postUtilService.getReply(action.payload.repliedToPost);
    },
    clearNewReply(state) {
      state.reply = postUtilService.getReply(null);
    },
    setNewQuote(state, action: PayloadAction<{ quotedPost: Post }>) {
      state.newPostType = NewPostType.Quote;
      state.quote = postUtilService.getQuote(action.payload.quotedPost);
    },
    clearNewQuote(state) {
      state.quote = postUtilService.getQuote(null);
    },
    setCurrNewPost(state, action: PayloadAction<{ newPost: NewPost }>) {
      const { newPostType } = state;
      if (newPostType === NewPostType.Reply || newPostType === NewPostType.Quote) return;

      const { newPost } = action.payload;

      state[newPostType] = {
        ...state[newPostType],
        currPostIdx: state[newPostType].posts.findIndex(p => p.tempId === newPost.tempId),
      };
    },
    addNewPostToThread(state) {
      const { newPostType } = state;
      if (newPostType === NewPostType.Reply || newPostType === NewPostType.Quote) return;

      state[newPostType] = {
        ...state[newPostType],
        posts: [...state[newPostType].posts, postUtilService.getDefaultNewPost()],
        currPostIdx: state[newPostType].posts.length,
      };
    },
    updateNewPost(state, action: PayloadAction<{ newPost: NewPost }>) {
      const { newPostType } = state;
      const { newPost } = action.payload;

      switch (newPostType) {
        case NewPostType.HomePage:
          state.homePage.posts = state.homePage.posts.map(p => {
            if (p.tempId === newPost.tempId) return newPost;
            return p;
          });
          break;
        case NewPostType.SideBar:
          state.sideBar.posts = state.sideBar.posts.map(p => {
            if (p.tempId === newPost.tempId) return newPost;
            return p;
          });
          break;
        case NewPostType.Reply:
          state.reply.reply = newPost;
          break;
        case NewPostType.Quote:
          state.quote.quote = newPost;
          break;
      }
    },
    removeNewPost(state) {
      const { newPostType } = state;
      if (newPostType === NewPostType.Reply || newPostType === NewPostType.Quote) return;

      if (state[newPostType].posts.length === 1) return;

      state[newPostType].posts = state[newPostType].posts.filter(
        (_, idx) => state[newPostType].currPostIdx !== idx
      );

      state[newPostType].currPostIdx = state[newPostType].currPostIdx - 1 || 0;
    },
    clearAllNewPosts() {
      return { ...initialState };
    },
  },
});

export const {
  setNewPostType,
  setNewHomePosts,
  clearNewHomePosts,
  setNewSideBarPosts,
  clearNewSideBarPosts,
  setNewReply,
  clearNewReply,
  setNewQuote,
  clearNewQuote,
  setCurrNewPost,
  addNewPostToThread,
  updateNewPost,
  removeNewPost,
  clearAllNewPosts,
} = postEditSlice.actions;

export default postEditSlice.reducer;
