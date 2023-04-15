import {
  legacy_createStore as createStore,
  applyMiddleware,
  combineReducers,
} from "redux";
import thunk, { ThunkMiddleware } from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";

import { authReducer } from "./reducers/auth.reducer";
import { systemReducer } from "./reducers/system.reducer";
import { userReducer } from "./reducers/user.reducer";
import { postReducer } from "./reducers/post.reducer";

const rootReducer = combineReducers({
  userModule: userReducer,
  authModule: authReducer,
  systemModule: systemReducer,
  postModule: postReducer,
});

export const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk as ThunkMiddleware))
);

export type RootState = ReturnType<typeof store.getState>;
