import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NewPost, Post, repliedPostDetails } from "../../../../shared/types/post.interface";
import { makeId } from "../../services/util/utilService";

export type NewPostState = {
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
    reply: NewPost;
  };
  quote: {
    quotedPost: Post | null;
    quote: NewPost;
  };
  newPostType: NewPostType;
};

export enum NewPostType {
  HomePage = "homePage",
  SideBar = "sideBar",
  Reply = "reply",
  Quote = "quote",
}

const _getDefaultNewPost = (
  repliedPostDetails?: repliedPostDetails[],
  quotedPostId?: string
): NewPost => {
  return {
    tempId: makeId(),
    text: "",
    audience: "everyone",
    repliersType: "everyone",
    parentPostId: repliedPostDetails?.length ? repliedPostDetails.at(-1)?.postId : undefined,
    repliedPostDetails,
    isPublic: true,
    isPinned: false,
    quotedPostId: quotedPostId,
    imgs: [],
    video: null,
    videoUrl: "",
    gif: null,
    poll: null,
  };
};

function _getReply(repliedToPost: Post): { repliedToPost: Post | null; reply: NewPost } {
  if (!repliedToPost) return { repliedToPost: null, reply: _getDefaultNewPost() };
  const {
    createdBy: { id: userId, username },
  } = repliedToPost;

  const currRepliedPostDetails = {
    postId: repliedToPost.id,
    postOwner: { userId, username },
  };

  const repliedPostDetails = repliedToPost.repliedPostDetails?.length
    ? [...repliedToPost.repliedPostDetails, currRepliedPostDetails]
    : [currRepliedPostDetails];

  return {
    repliedToPost: repliedToPost,
    reply: _getDefaultNewPost(repliedPostDetails),
  };
}

function _getQuote(quotedPost: Post): { quotedPost: Post | null; quote: NewPost } {
  return quotedPost
    ? {
        quotedPost: quotedPost,
        quote: _getDefaultNewPost(undefined, quotedPost.id),
      }
    : {
        quotedPost: null,
        quote: _getDefaultNewPost(),
      };
}

const initialState: NewPostState = {
  homePage: {
    posts: [_getDefaultNewPost()],
    currPostIdx: 0,
  },
  sideBar: {
    posts: [_getDefaultNewPost()],
    currPostIdx: 0,
  },
  reply: {
    repliedToPost: null,
    reply: _getDefaultNewPost(),
  },
  quote: {
    quotedPost: null,
    quote: _getDefaultNewPost(),
  },
  newPostType: NewPostType.HomePage,
};

const newPostSlice = createSlice({
  name: "newPost",
  initialState,
  reducers: {
    setNewPostType(state, action: PayloadAction<NewPostType>) {
      state.newPostType = action.payload;
    },
    setNewPosts(
      state,
      action: PayloadAction<{ newPosts: NewPost[]; newPostType: NewPostType; post?: Post | null }>
    ) {
      const { newPostType } = action.payload;
      switch (newPostType) {
        case NewPostType.HomePage:
          state.homePage = {
            posts: action.payload.newPosts.length
              ? action.payload.newPosts
              : [_getDefaultNewPost()],
            currPostIdx: 0,
          };
          break;
        case NewPostType.SideBar:
          state.sideBar = {
            posts: action.payload.newPosts.length
              ? action.payload.newPosts
              : [_getDefaultNewPost()],
            currPostIdx: 0,
          };
          break;
        case NewPostType.Reply:
          state.reply = _getReply(action.payload.post as Post);
          break;
        case NewPostType.Quote:
          state.quote = _getQuote(action.payload.post as Post);
          break;
        default:
          break;
      }
    },
    setNewPost(
      state,
      action: PayloadAction<{ newPost: NewPost | null; newPostType: NewPostType }>
    ) {
      const { newPost, newPostType } = action.payload;
      if (newPost === null) return;
      const isThreadType =
        newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar;
      if (!isThreadType) return;
      state[newPostType] = {
        ...state[newPostType],
        currPostIdx: state[newPostType].posts.findIndex(p => p.tempId === newPost.tempId),
      };
    },
    addNewPostToThread(state, action: PayloadAction<NewPostType>) {
      const newPostType = action.payload;
      if (newPostType === NewPostType.Reply || newPostType === NewPostType.Quote) return;
      state[newPostType] = {
        ...state[newPostType],
        posts: [...state[newPostType].posts, _getDefaultNewPost()],
        currPostIdx: state[newPostType].posts.length,
      };
    },
    updateNewPost(state, action: PayloadAction<{ newPost: NewPost; newPostType: NewPostType }>) {
      const { newPost, newPostType } = action.payload;

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
        default:
          break;
      }
    },
    removeNewPost(state, action: PayloadAction<NewPostType>) {
      const newPostType = action.payload;
      if (newPostType === NewPostType.Reply || newPostType === NewPostType.Quote) return;
      state[newPostType].posts = state[newPostType].posts.filter(
        (_, idx) => state[newPostType].currPostIdx !== idx
      );
      state[newPostType].currPostIdx = state[newPostType].currPostIdx - 1 || 0;
    },
    clearNewPosts() {
      return { ...initialState };
    },
  },
});

export const {
  setNewPostType,
  setNewPosts,
  setNewPost,
  addNewPostToThread,
  updateNewPost,
  removeNewPost,
  clearNewPosts,
} = newPostSlice.actions;

export default newPostSlice.reducer;
