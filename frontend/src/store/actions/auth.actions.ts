import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { RootState } from "../store";
import { UserCredentials } from "../../types/auth.types";
import authService from "../../services/auth.service";

export function signup(
  userCredentials: UserCredentials
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const user = await authService.signup(userCredentials);
      dispatch({ type: "SET_LOGGEDIN_USER", user });
    } catch (err) {
      console.log("AuthActions: err in signup", err);
    }
  };
}

export function login(
  username: string,
  password: string
): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      const user = await authService.login(username, password);
      dispatch({ type: "SET_LOGGEDIN_USER", user });
    } catch (err) {
      console.log("AuthActions: err in login", err);
    }
  };
}

export function loginWithToken(): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      dispatch({ type: "SET_IS_PAGE_LOADING", isPageLoading: true });
      const user = await authService.loginWithToken();
      dispatch({ type: "SET_LOGGEDIN_USER", user });
      dispatch({ type: "SET_IS_PAGE_LOADING", isPageLoading: false });
    } catch (err) {
      console.log("AuthActions: err in loginWithToken", err);
    }
  };
}

export function logout(): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
  return async dispatch => {
    try {
      await authService.logout();
      dispatch({ type: "LOGOUT" });
    } catch (err) {
      console.log("AuthActions: err in logout", err);
    }
  };
}
