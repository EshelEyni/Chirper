import { NewPost, Post, repliedPostDetails } from "../../../../shared/interfaces/post.interface";

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
  newPostType: NewPostType;
};

export type NewPostType = "home-page" | "side-bar" | "reply";

const getDefaultNewPost = (idx = 0, repliedPostDetails?: repliedPostDetails[]): NewPost => {
  return {
    idx,
    text: "",
    audience: "everyone",
    repliersType: "everyone",
    repliedPostDetails,
    isPublic: true,
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
  newPostType: "home-page",
};

export function newPostReducer(
  state = initialState,
  action: {
    type: string;
    repliedToPost: Post;
    newPosts: NewPost[];
    newPost: NewPost;
    updatedPost: NewPost;
    newPostType: NewPostType;
    currPostIdx: number;
  }
) {
  switch (action.type) {
    case "SET_NEW_POST_TYPE": {
      return { ...state, newPostType: action.newPostType };
    }
    case "SET_NEW_POSTS": {
      let newPostState: NewPostState = { ...state };
      if (action.newPostType === "home-page") {
        newPostState = {
          ...state,
          homePage: {
            posts: action.newPosts.length ? action.newPosts : [getDefaultNewPost()],
            currPostIdx: 0,
          },
        };
      } else if (action.newPostType === "side-bar") {
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
            reply: getDefaultNewPost(0, repliedPostDetails),
          },
        };
      }

      return newPostState;
    }
    case "SET_NEW_POST": {
      let newPostState: NewPostState = { ...state };
      if (action.newPostType === "home-page") {
        newPostState = {
          ...state,
          homePage: { ...state.homePage, currPostIdx: action.newPost.idx },
        };
      } else if (action.newPostType === "side-bar") {
        newPostState = {
          ...state,
          sideBar: { ...state.sideBar, currPostIdx: action.newPost.idx },
        };
      }
      return newPostState;
    }
    case "ADD_NEW_POST": {
      let newPostState: NewPostState = { ...state };
      if (action.newPostType === "home-page") {
        const currPostIdx = state.homePage.posts.length;
        const newPosts = [...state.homePage.posts, getDefaultNewPost(currPostIdx)];
        newPostState = { ...state, homePage: { posts: newPosts, currPostIdx } };
      } else if (action.newPostType === "side-bar") {
        const currPostIdx = state.sideBar.posts.length;
        const newPosts = [...state.sideBar.posts, getDefaultNewPost(currPostIdx)];
        newPostState = { ...state, sideBar: { posts: newPosts, currPostIdx } };
      }
      return newPostState;
    }
    case "UPDATE_NEW_POST": {
      let newPostState: NewPostState = { ...state };
      if (action.newPostType === "home-page") {
        const newPosts = state.homePage.posts.map((post, idx) =>
          state.homePage.currPostIdx === idx ? action.newPost : post
        );
        newPostState = { ...state, homePage: { ...state.homePage, posts: newPosts } };
      } else if (action.newPostType === "side-bar") {
        const newPosts = state.sideBar.posts.map((post, idx) =>
          state.sideBar.currPostIdx === idx ? action.newPost : post
        );
        newPostState = { ...state, sideBar: { ...state.sideBar, posts: newPosts } };
      } else if (action.newPostType === "reply") {
        newPostState = {
          ...state,
          reply: { ...state.reply, reply: action.newPost },
        };
      }

      return newPostState;
    }
    case "REMOVE_NEW_POST": {
      let newPostState: NewPostState = { ...state };
      if (action.newPostType === "home-page") {
        const newPosts = state.homePage.posts.filter(
          (_, idx) => state.homePage.currPostIdx !== idx
        );
        const currPostIdx = newPosts.length - 1;
        newPostState = { ...state, homePage: { posts: newPosts, currPostIdx } };
      } else if (action.newPostType === "side-bar") {
        const newPosts = state.sideBar.posts.filter((_, idx) => state.sideBar.currPostIdx !== idx);
        const currPostIdx = newPosts.length - 1;
        newPostState = { ...state, sideBar: { posts: newPosts, currPostIdx } };
      }
      return newPostState;
    }
    default:
      return state;
  }
}
