import {
  legacy_createStore as createStore,
  applyMiddleware,
  combineReducers,
  compose,
} from "redux";
import thunk from "redux-thunk";
import { authReducer } from "./reducers/auth.reducer";
import { systemReducer } from "./reducers/system.reducer";

import { userReducer } from "./reducers/user.reducer";

const composeEnhancers = compose;

const rootReducer = combineReducers({
  userModule: userReducer,
  authModule: authReducer,
  systemModule: systemReducer,
});

export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

export type RootState = ReturnType<typeof store.getState>
