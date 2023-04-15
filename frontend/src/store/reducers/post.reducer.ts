import { Post } from "./../../models/post";

const initialState: {
  posts: Post[];
  post: Post | null;
} = {
  posts: [],
  post: null,
};

export function postReducer(
  state = initialState,
  action: {
    type: string;
    posts: Post[];
    post: Post;
    postId: string;
    updatedPost: Post;
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
        posts: state.posts.filter((post) => post._id !== action.postId),
      };
    case "UPDATE_POST":
      return { ...state, post: action.updatedPost };
    default:
      return state;
  }
}
