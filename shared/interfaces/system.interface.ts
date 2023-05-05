import { User } from "./user.interface";

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
