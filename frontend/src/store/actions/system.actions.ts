import { ThunkAction } from "redux-thunk";
import { RootState } from "../store";
import { AnyAction } from "redux";

export function setIsPageLoading(
  isPageLoading: boolean
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async (dispatch) => {
    try {
      dispatch({ type: "SET_IS_PAGE_LOADING", isPageLoading });
    } catch (err) {
      console.log("PostActions: err in getPosts", err);
    }
  };
}

export function setIsSideBarShown(
  isSideBarShown: boolean
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async (dispatch) => {
    try {
      dispatch({ type: "SET_IS_SIDEBAR_SHOWN", isSideBarShown });
    } catch (err) {
      console.log("PostActions: err in getPosts", err);
    }
  };
}

export function setUserMsg(
  userMsg: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async (dispatch) => {
    try {
      dispatch({ type: "SET_USER_MSG", userMsg });
      setTimeout(() => {
        dispatch({ type: "SET_USER_MSG", userMsg: "" });
      }, 2000);
    } catch (err) {
      console.log("PostActions: err in getPosts", err);
    }
  };
}
