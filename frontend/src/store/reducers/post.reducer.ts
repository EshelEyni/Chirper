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
    loggedinUserId: string;
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
      const posts = state.posts.map(post => {
        if (post.id === action.post.id)
          return {
            ...post,
            repostsCount: post.repostsCount + 1,
            loggedinUserActionState: {
              ...post.loggedinUserActionState,
              isReposted: true,
            },
          };
        return post;
      });
      return { ...state, posts: [action.post, ...posts] };
    }
    case "REMOVE_REPOST": {
      const posts = state.posts
        .filter(
          post =>
            post.id !== action.post.id ||
            !(post.repostedBy && post.repostedBy.id === action.loggedinUserId)
        )
        .map(post => {
          if (post.id === action.post.id)
            return {
              ...post,
              repostsCount: post.repostsCount - 1,
              loggedinUserActionState: {
                ...post.loggedinUserActionState,
                isReposted: false,
              },
            };
          return post;
        });
      return { ...state, posts };
    }
    case "UPDATE_POST":
      return { ...state, post: action.updatedPost };
    default:
      return state;
  }
}
