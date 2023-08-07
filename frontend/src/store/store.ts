import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { configureStore } from "@reduxjs/toolkit";

import { userReducer } from "./reducers/user.reducer";
import { postReducer } from "./reducers/post.reducer";
import systemSlice from "./slices/systemSlice";
import authSlice from "./slices/authSlice";
import postEditSlice from "./slices/postEditSlice";

export const store = configureStore({
  reducer: {
    userModule: userReducer as any,
    auth: authSlice,
    system: systemSlice,
    postModule: postReducer as any,
    postEdit: postEditSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<Promise<void>, RootState, undefined, AnyAction>;
