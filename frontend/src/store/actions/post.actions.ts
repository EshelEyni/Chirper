import { ThunkAction } from 'redux-thunk';
import { AnyAction } from 'redux';
import { postService } from "../../services/post.service";
import { RootState } from '../store';

export function getPosts(): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
    return async (dispatch) => {
      try {
        const posts = await postService.query();
        console.log("PostActions: posts", posts);
        dispatch({ type: "SET_POSTS", posts });
      } catch (err) {
        console.log("PostActions: err in getPosts", err);
      }
    };
  }
