import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserCredenitials } from "../../../../shared/types/user";
import authApiService from "../../services/authApi/authApiService";
import { setIsPageLoading } from "./systemSlice";
import { AppThunk } from "../../types/app";

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

export function signup(userCredentials: UserCredenitials): AppThunk {
  return async dispatch => {
    const user = await authApiService.signup(userCredentials);
    dispatch(setLoggedInUser(user));
  };
}

export function login(username: string, password: string): AppThunk {
  return async dispatch => {
    const user = await authApiService.login(username, password);
    dispatch(setLoggedInUser(user));
  };
}

export function loginWithToken(): AppThunk {
  return async dispatch => {
    dispatch(setIsPageLoading(true));
    const user = await authApiService.loginWithToken();
    dispatch(setLoggedInUser(user));
  };
}

export function userLogout(): AppThunk {
  return async dispatch => {
    await authApiService.logout();
    dispatch(logout());
  };
}
