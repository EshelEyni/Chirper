import { NewPost, Post, repliedPostDetails } from "../../../../shared/interfaces/post.interface";
import { makeId } from "../../services/util/utils.service";

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

type NewPostsAction = {
  type: string;
  repliedToPost: Post;
  quotedPost: Post;
  newPosts: NewPost[];
  newPost: NewPost | null;
  updatedPost: NewPost;
  newPostType: NewPostType;
  currPostIdx: number;
};

export enum NewPostType {
  HomePage = "homePage",
  SideBar = "sideBar",
  Reply = "reply",
  Quote = "quote",
}

const getDefaultNewPost = (
  repliedPostDetails?: repliedPostDetails[],
  quotedPostId?: string
): NewPost => {
  return {
    tempId: makeId(),
    text: "",
    audience: "everyone",
    repliersType: "everyone",
    previousThreadPostId: repliedPostDetails?.length
      ? repliedPostDetails.at(-1)?.postId
      : undefined,
    repliedPostDetails,
    isPublic: true,
    quotedPostId: quotedPostId,
    imgs: [],
    video: null,
    videoUrl: "",
    gif: null,
    poll: null,
  };
};

const initialState: NewPostState = {
  homePage: {
    posts: [getDefaultNewPost()],
    currPostIdx: 0,
  },
  sideBar: {
    posts: [getDefaultNewPost()],
    currPostIdx: 0,
  },
  reply: {
    repliedToPost: null,
    reply: getDefaultNewPost(),
  },
  quote: {
    quotedPost: null,
    quote: getDefaultNewPost(),
  },
  newPostType: NewPostType.HomePage,
};

function getReply(repliedToPost: Post): { repliedToPost: Post | null; reply: NewPost } {
  const {
    id,
    createdBy: { id: userId, username },
  } = repliedToPost;

  const currRepliedPostDetails = {
    postId: id,
    postOwner: { userId, username },
  };

  const repliedPostDetails = repliedToPost.repliedPostDetails?.length
    ? [...repliedToPost.repliedPostDetails, currRepliedPostDetails]
    : [currRepliedPostDetails];

  return repliedToPost
    ? {
        repliedToPost: repliedToPost,
        reply: getDefaultNewPost(repliedPostDetails),
      }
    : { repliedToPost: null, reply: getDefaultNewPost() };
}

function getQuote(quotedPost: Post): { quotedPost: Post | null; quote: NewPost } {
  return quotedPost
    ? {
        quotedPost: quotedPost,
        quote: getDefaultNewPost(undefined, quotedPost.id),
      }
    : {
        quotedPost: null,
        quote: getDefaultNewPost(),
      };
}

export function newPostReducer(state = initialState, action: NewPostsAction): NewPostState {
  switch (action.type) {
    case "SET_NEW_POST_TYPE": {
      return { ...state, newPostType: action.newPostType };
    }
    case "SET_NEW_POSTS": {
      const { newPostType } = action;

      switch (newPostType) {
        case NewPostType.HomePage:
          return {
            ...state,
            homePage: {
              posts: action.newPosts.length ? action.newPosts : [getDefaultNewPost()],
              currPostIdx: 0,
            },
          };
        case NewPostType.SideBar:
          return {
            ...state,
            sideBar: {
              posts: action.newPosts.length ? action.newPosts : [getDefaultNewPost()],
              currPostIdx: 0,
            },
          };
        case NewPostType.Reply:
          return {
            ...state,
            reply: getReply(action.repliedToPost),
          };
        case NewPostType.Quote:
          return {
            ...state,
            quote: getQuote(action.quotedPost),
          };
        default:
          return state;
      }
    }
    case "SET_NEW_POST": {
      const { newPost, newPostType } = action;
      if (newPost === null) return state;
      const isThreadType =
        newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar;
      if (!isThreadType) return state;
      return {
        ...state,
        [newPostType]: {
          ...state[newPostType],
          currPostIdx: state[newPostType].posts.findIndex(p => p.tempId === newPost.tempId),
        },
      };
    }
    case "ADD_NEW_POST": {
      let newPostState: NewPostState = { ...state };
      if (action.newPostType === NewPostType.HomePage) {
        const currPostIdx = state.homePage.posts.length;
        const newPosts = [...state.homePage.posts, getDefaultNewPost()];
        newPostState = { ...state, homePage: { posts: newPosts, currPostIdx } };
      } else if (action.newPostType === NewPostType.SideBar) {
        const currPostIdx = state.sideBar.posts.length;
        const newPosts = [...state.sideBar.posts, getDefaultNewPost()];
        newPostState = { ...state, sideBar: { posts: newPosts, currPostIdx } };
      }
      return newPostState;
    }
    case "UPDATE_NEW_POST": {
      let newPostState: NewPostState = { ...state };
      if (action.newPost === null) return newPostState;

      if (action.newPostType === NewPostType.HomePage) {
        const newPosts = state.homePage.posts.map((post, idx) =>
          state.homePage.currPostIdx === idx ? (action.newPost as NewPost) : post
        );
        newPostState = { ...state, homePage: { ...state.homePage, posts: newPosts } };
      } else if (action.newPostType === NewPostType.SideBar) {
        const newPosts = state.sideBar.posts.map((post, idx) =>
          state.sideBar.currPostIdx === idx ? (action.newPost as NewPost) : post
        );
        newPostState = { ...state, sideBar: { ...state.sideBar, posts: newPosts } };
      } else if (action.newPostType === "reply") {
        newPostState = {
          ...state,
          reply: { ...state.reply, reply: action.newPost },
        };
      } else if (action.newPostType === "quote") {
        newPostState = {
          ...state,
          quote: { ...state.quote, quote: action.newPost },
        };
      }

      return newPostState;
    }
    case "REMOVE_NEW_POST": {
      let newPostState: NewPostState = { ...state };
      if (action.newPostType === NewPostType.HomePage) {
        const newPosts = state.homePage.posts.filter(
          (_, idx) => state.homePage.currPostIdx !== idx
        );
        const currPostIdx = newPosts.length - 1;
        newPostState = { ...state, homePage: { posts: newPosts, currPostIdx } };
      } else if (action.newPostType === NewPostType.SideBar) {
        const newPosts = state.sideBar.posts.filter((_, idx) => state.sideBar.currPostIdx !== idx);
        const currPostIdx = newPosts.length - 1;
        newPostState = { ...state, sideBar: { posts: newPosts, currPostIdx } };
      }
      return newPostState;
    }
    case "CLEAR_NEW_POSTS": {
      return { ...initialState };
    }
    default:
      return state;
  }
}
