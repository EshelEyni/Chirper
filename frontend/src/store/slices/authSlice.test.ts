/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, beforeEach, it, expect, vi, Mock } from "vitest";
import { setLoggedInUser, logout, signup, login, loginWithToken, userLogout } from "./authSlice";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import systemReducer from "./systemSlice";
import authApiService from "../../services/authApi/authApiService";

vi.mock("../../services/authApi/authApiService");

describe("authSlice", () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        system: systemReducer,
      },
    });
  });

  it("should set loggedInUser", () => {
    const user = { id: "1", username: "testUser" };
    store.dispatch(setLoggedInUser(user as any));
    const state1 = store.getState().auth;
    expect(state1.loggedInUser).toEqual(user);

    store.dispatch(setLoggedInUser(null));
    const state2 = store.getState().auth;
    expect(state2.loggedInUser).toBe(null);
  });

  it("should logout user", () => {
    const user = { id: "1", username: "testUser" };
    store.dispatch(setLoggedInUser(user as any));
    store.dispatch(logout());
    const state = store.getState().auth;
    expect(state.loggedInUser).toBe(null);
  });
});

describe("Thunks", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        system: systemReducer,
      },
    });
  });

  describe("signup", () => {
    it("should signup a user", async () => {
      const userCredentials = { username: "test", password: "test" } as any;
      const user = { id: "1", username: "testUser" } as any;

      (authApiService.signup as Mock).mockResolvedValue(user);

      await store.dispatch(signup(userCredentials));
      const state = store.getState().auth;
      expect(state.loggedInUser).toEqual(user);
    });
  });

  describe("login", () => {
    it("should login a user", async () => {
      const username = "test";
      const password = "test";
      const user = { id: "1", username: "testUser" };

      (authApiService.login as Mock).mockResolvedValue(user);

      await store.dispatch(login(username, password));
      const state = store.getState().auth;
      expect(state.loggedInUser).toEqual(user);
    });
  });

  describe("loginWithToken", () => {
    it("should login a user with token", async () => {
      const user = { id: "1", username: "testUser" };

      (authApiService.loginWithToken as Mock).mockResolvedValue(user);

      await store.dispatch(loginWithToken());
      const state = store.getState().auth;
      expect(state.loggedInUser).toEqual(user);
    });
  });

  describe("userLogout", () => {
    it("should logout a user", async () => {
      (authApiService.logout as Mock).mockResolvedValue(null);

      await store.dispatch(userLogout());
      const state = store.getState().auth;
      expect(state.loggedInUser).toBe(null);
    });
  });
});
