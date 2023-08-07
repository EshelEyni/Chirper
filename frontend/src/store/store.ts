// import { legacy_createStore as createStore, applyMiddleware, combineReducers } from "redux";
// import thunk, { ThunkMiddleware } from "redux-thunk";
// import { composeWithDevTools } from "redux-devtools-extension";
import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { configureStore } from "@reduxjs/toolkit";

// import { authReducer } from "./reducers/auth.reducer";
// import { systemReducer } from "./reducers/system.reducer";
import { userReducer } from "./reducers/user.reducer";
import { postReducer } from "./reducers/post.reducer";
import { newPostReducer } from "./reducers/new-post.reducer";
import systemSlice from "./slices/systemSlice";
import authSlice from "./slices/authSlice";

// const rootReducer = combineReducers({
//   userModule: userReducer,
//   auth: authReducer,
//   systemModule: systemReducer,
//   postModule: postReducer,
//   newPostModule: newPostReducer,
// });

// export const store = createStore(
//   rootReducer,
//   composeWithDevTools(applyMiddleware(thunk as ThunkMiddleware))
// );

// export type RootState = ReturnType<typeof store.getState>;

export const store = configureStore({
  reducer: {
    userModule: userReducer as any,
    auth: authSlice,
    system: systemSlice,
    postModule: postReducer as any,
    newPostModule: newPostReducer as any,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<Promise<void>, RootState, undefined, AnyAction>;
