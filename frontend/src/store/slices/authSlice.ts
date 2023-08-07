import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../store";
import { User } from "../../../../shared/interfaces/user.interface";
import { UserCredentials } from "../../types/auth.types";
import authService from "../../services/auth.service";
import { setIsPageLoading } from "./systemSlice";

interface AuthState {
  loggedInUser: User | null;
}

const initialState: AuthState = {
  loggedInUser: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoggedInUser(state, action: PayloadAction<User | null>) {
      state.loggedInUser = action.payload;
    },
    logout(state) {
      state.loggedInUser = null;
    },
  },
});

export const { setLoggedInUser, logout } = authSlice.actions;

export default authSlice.reducer;

export const signup =
  (userCredentials: UserCredentials): AppThunk =>
  async dispatch => {
    try {
      const user = await authService.signup(userCredentials);
      dispatch(setLoggedInUser(user));
    } catch (err) {
      console.log("AuthActions: err in signup", err);
    }
  };

export const login =
  (username: string, password: string): AppThunk =>
  async dispatch => {
    try {
      const user = await authService.login(username, password);
      dispatch(setLoggedInUser(user));
    } catch (err) {
      console.log("AuthActions: err in login", err);
    }
  };

export const loginWithToken = (): AppThunk => async dispatch => {
  try {
    dispatch(setIsPageLoading(true));
    const user = await authService.loginWithToken();
    dispatch(setLoggedInUser(user));
    dispatch(setIsPageLoading(false));
  } catch (err) {
    console.log("AuthActions: err in loginWithToken", err);
  }
};

export const userLogout = (): AppThunk => async dispatch => {
  try {
    await authService.logout();
    dispatch(logout());
  } catch (err) {
    console.log("AuthActions: err in logout", err);
  }
};
