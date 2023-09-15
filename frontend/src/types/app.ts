import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { store } from "../store/store";

export type ReduxStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk = ThunkAction<Promise<void>, RootState, undefined, AnyAction>;
export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>;

export type BtnCreatePostTitle = "Chirp" | "Chirp All" | "Schedule" | "Reply";

export type CachedData<T> = {
  data: T;
  cachedAt: number;
};
