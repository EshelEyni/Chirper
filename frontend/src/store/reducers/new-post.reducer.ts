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

export function newPostReducer(
  state = initialState,
  action: {
    type: string;
    repliedToPost: Post;
    quotedPost: Post;
    newPosts: NewPost[];
    newPost: NewPost;
    updatedPost: NewPost;
    newPostType: NewPostType;
    currPostIdx: number;
  }
): NewPostState {
  switch (action.type) {
    case "SET_NEW_POST_TYPE": {
      return { ...state, newPostType: action.newPostType };
    }
    case "SET_NEW_POSTS": {
      let newPostState: NewPostState = { ...state };
      if (action.newPostType === NewPostType.HomePage) {
        newPostState = {
          ...state,
          homePage: {
            posts: action.newPosts.length ? action.newPosts : [getDefaultNewPost()],
            currPostIdx: 0,
          },
        };
      } else if (action.newPostType === NewPostType.SideBar) {
        newPostState = {
          ...state,
          sideBar: {
            posts: action.newPosts.length ? action.newPosts : [getDefaultNewPost()],
            currPostIdx: 0,
          },
        };
      } else if (action.newPostType === "reply") {
        if (!action.repliedToPost) {
          newPostState = {
            ...state,
            reply: {
              repliedToPost: null,
              reply: getDefaultNewPost(),
            },
          };
          return newPostState;
        }

        const {
          id,
          createdBy: { id: userId, username },
        } = action.repliedToPost;

        const currRepliedPostDetails = {
          postId: id,
          postOwner: { userId, username },
        };

        const repliedPostDetails = action.repliedToPost.repliedPostDetails?.length
          ? [...action.repliedToPost.repliedPostDetails, currRepliedPostDetails]
          : [currRepliedPostDetails];

        newPostState = {
          ...state,
          reply: {
            repliedToPost: action.repliedToPost,
            reply: getDefaultNewPost(repliedPostDetails),
          },
        };
      } else if (action.newPostType === "quote") {
        if (!action.quotedPost) {
          newPostState = {
            ...state,
            quote: {
              quotedPost: null,
              quote: getDefaultNewPost(),
            },
          };

          return newPostState;
        }

        newPostState = {
          ...state,
          quote: {
            quotedPost: action.quotedPost,
            quote: getDefaultNewPost(undefined, action.quotedPost.id),
          },
        };
      }

      return newPostState;
    }
    case "SET_NEW_POST": {
      let newPostState: NewPostState = { ...state };
      if (action.newPostType === NewPostType.HomePage) {
        newPostState = {
          ...state,
          homePage: {
            ...state.homePage,
            currPostIdx: state.homePage.posts.findIndex(
              post => post.tempId === action.newPost.tempId
            ),
          },
        };
      } else if (action.newPostType === NewPostType.SideBar) {
        newPostState = {
          ...state,
          sideBar: {
            ...state.sideBar,
            currPostIdx: state.sideBar.posts.findIndex(
              post => post.tempId === action.newPost.tempId
            ),
          },
        };
      }
      return newPostState;
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
      if (action.newPostType === NewPostType.HomePage) {
        const newPosts = state.homePage.posts.map((post, idx) =>
          state.homePage.currPostIdx === idx ? action.newPost : post
        );
        newPostState = { ...state, homePage: { ...state.homePage, posts: newPosts } };
      } else if (action.newPostType === NewPostType.SideBar) {
        const newPosts = state.sideBar.posts.map((post, idx) =>
          state.sideBar.currPostIdx === idx ? action.newPost : post
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
