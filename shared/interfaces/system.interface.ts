import { User } from "./user.interface";

import { Query } from "mongoose";

export interface CustomQuery<T> extends Query<T, T> {
  start: number;
}

export interface JsendResponse {
  status: string;
  requested_at?: string;
  result?: number;
  data?: any;
  message?: string;
}

export interface IAsyncLocalStorageStore {
  loggedinUser?: User;
}
