import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { RootState } from "./store";

export type AppDispatch = ThunkDispatch<RootState, undefined, AnyAction>;
