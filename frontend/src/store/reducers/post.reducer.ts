import { NewPost, Post } from "../../../../shared/interfaces/post.interface";

export type NewPostState = {
  homePage: {
    posts: NewPost[];
    currPostIdx: number;
  };
  sideBar: {
    posts: NewPost[];
    currPostIdx: number;
  };
  newPostType: NewPostType;
};

export type NewPostType = "home-page" | "side-bar";

const getDefaultNewPost: NewPost = {
  text: "",
  audience: "everyone",
  repliersType: "everyone",
  isPublic: true,
  imgs: [],
  video: null,
  videoUrl: "",
  gif: null,
  poll: null,
};

const initialState: {
  posts: Post[];
  post: Post | null;
  newPostState: NewPostState;
} = {
  posts: [],
  post: null,
  newPostState: {
    homePage: {
      posts: [{ ...getDefaultNewPost }],
      currPostIdx: 0,
    },
    sideBar: {
      posts: [{ ...getDefaultNewPost }],
      currPostIdx: 0,
    },
    newPostType: "home-page",
  },
};

export function postReducer(
  state = initialState,
  action: {
    type: string;
    posts: Post[];
    post: Post;
    postId: string;
    updatedPost: Post;
    newPostState: NewPostState;
    newPosts: NewPost[];
    newPost: NewPost;
    newPostType: NewPostType;
  }
) {
  switch (action.type) {
    case "SET_POSTS":
      return { ...state, posts: action.posts };
    case "SET_POST":
      return { ...state, post: action.post };
    case "REMOVE_POST":
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.postId),
      };
    case "ADD_POST":
      return { ...state, posts: [action.post, ...state.posts] };
    case "UPDATE_POST":
      return { ...state, post: action.updatedPost };
    /****************** New Posts Actions ******************/
    case "SET_HOME_PAGE_NEW_POSTS": {
      const newPostState: NewPostState = {
        ...state.newPostState,
        homePage: {
          posts: action.newPosts.length ? action.newPosts : [{ ...getDefaultNewPost }],
          currPostIdx: 0,
        },
      };

      return {
        ...state,
        newPostState,
      };
    }
    case "ADD_HOME_PAGE_NEW_POST": {
      const newPosts = [...state.newPostState.homePage.posts, action.newPost];
      const currPostIdx = newPosts.length - 1;
      const newPostState: NewPostState = {
        ...state.newPostState,
        homePage: {
          posts: newPosts,
          currPostIdx,
        },
      };
      return {
        ...state,
        newPostState,
      };
    }
    case "UPDATE_HOME_PAGE_NEW_POST": {
      const newPosts = state.newPostState.homePage.posts.map((post, idx) =>
        state.newPostState.homePage.currPostIdx === idx ? action.newPost : post
      );
      const newPostState: NewPostState = {
        ...state.newPostState,
        homePage: {
          ...state.newPostState.homePage,
          posts: newPosts,
        },
      };
      return {
        ...state,
        newPostState,
      };
    }
    case "REMOVE_HOME_PAGE_NEW_POST": {
      const newPosts = state.newPostState.homePage.posts.filter(
        (_, idx) => state.newPostState.homePage.currPostIdx !== idx
      );
      const currPostIdx = newPosts.length - 1;
      const newPostState: NewPostState = {
        ...state.newPostState,
        homePage: {
          posts: newPosts,
          currPostIdx,
        },
      };
      return {
        ...state,
        newPostState,
      };
    }
    case "SET_SIDE_BAR_NEW_POSTS": {
      const newPostState: NewPostState = {
        ...state.newPostState,
        sideBar: {
          posts: action.newPosts.length ? action.newPosts : [{ ...getDefaultNewPost }],
          currPostIdx: 0,
        },
      };

      return {
        ...state,
        newPostState,
      };
    }
    case "ADD_SIDE_BAR_NEW_POST": {
      const newPosts = [...state.newPostState.sideBar.posts, action.newPost];
      const currPostIdx = newPosts.length - 1;
      const newPostState: NewPostState = {
        ...state.newPostState,
        sideBar: {
          posts: newPosts,
          currPostIdx,
        },
      };
      return {
        ...state,
        newPostState,
      };
    }
    case "UPDATE_SIDE_BAR_NEW_POST": {
      const newPosts = state.newPostState.sideBar.posts.map((post, idx) =>
        state.newPostState.sideBar.currPostIdx === idx ? action.newPost : post
      );
      const newPostState: NewPostState = {
        ...state.newPostState,
        sideBar: {
          ...state.newPostState.sideBar,
          posts: newPosts,
        },
      };
      return {
        ...state,
        newPostState,
      };
    }
    case "REMOVE_SIDE_BAR_NEW_POST": {
      const newPosts = state.newPostState.sideBar.posts.filter(
        (_, idx) => state.newPostState.sideBar.currPostIdx !== idx
      );
      const currPostIdx = newPosts.length - 1;
      const newPostState: NewPostState = {
        ...state.newPostState,
        sideBar: {
          posts: newPosts,
          currPostIdx,
        },
      };
      return {
        ...state,
        newPostState,
      };
    }
    case "SET_NEW_POST_TYPE": {
      const newPostState: NewPostState = {
        ...state.newPostState,
        newPostType: action.newPostType,
      };
      return {
        ...state,
        newPostState,
      };
    }
    default:
      return state;
  }
}
