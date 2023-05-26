import { NewPost, Post } from "../../../../shared/interfaces/post.interface";

export type NewPostType = "post" | "side-bar-post";

const defaultNewPost: NewPost = {
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
  newPost: NewPost;
  sideBarNewPost: NewPost;
  newPostType: NewPostType;
} = {
  posts: [],
  post: null,
  newPost: defaultNewPost,
  sideBarNewPost: defaultNewPost,
  newPostType: "post",
};

export function postReducer(
  state = initialState,
  action: {
    type: string;
    posts: Post[];
    post: Post;
    postId: string;
    updatedPost: Post;
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
    case "SET_NEW_POST":
      return { ...state, newPost: action.newPost };
    case "CLEAR_NEW_POST":
      return {
        ...state,
        newPost: defaultNewPost,
      };
    case "SET_SIDEBAR_NEW_POST":
      return { ...state, sideBarNewPost: action.newPost };
    case "CLEAR_SIDEBAR_NEW_POST":
      return {
        ...state,
        sideBarNewPost: defaultNewPost,
      };
    case "SET_NEW_POST_TYPE":
      return { ...state, newPostType: action.newPostType };
    default:
      return state;
  }
}
