import { Post } from "../../../../shared/interfaces/post.interface";

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
    reply: Post;
    repost: Post;
    postId: string;
    updatedPost: Post;
    loggedInUserId: string;
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
    case "ADD_REPLY": {
      return {
        ...state,
        posts: [
          action.reply,
          ...state.posts.map(post => {
            if (post.id === action.post.id) return action.post;
            return post;
          }),
        ],
      };
    }
    case "ADD_REPOST": {
      return {
        ...state,
        posts: [
          action.repost,
          ...state.posts.map(post => {
            if (post.id === action.post.id) return action.post;
            return post;
          }),
        ],
      };
    }
    case "REMOVE_REPOST": {
      return {
        ...state,
        posts: state.posts
          .filter(
            post =>
              post.id !== action.post.id ||
              !(post.repostedBy && post.repostedBy.id === action.loggedInUserId)
          )
          .map(post => {
            if (post.id === action.post.id) return action.post;
            return post;
          }),
      };
    }
    case "UPDATE_POST":
      return {
        posts: state.posts.map(post => {
          if (post.id === action.updatedPost.id) return action.updatedPost;
          return post;
        }),
        post:
          state.post && state.post.id === action.updatedPost.id ? action.updatedPost : state.post,
      };
    default:
      return state;
  }
}
