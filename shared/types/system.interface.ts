import { User } from "./user.interface";

export interface JsendResponse {
  status: string;
  requested_at?: string;
  result?: number;
  data?: any;
  message?: string;
}

export interface IAsyncLocalStorageStore {
  loggedInUser?: User;
}

export interface UserMsg {
  type: "info" | "success" | "error" | "warning" | "";
  text: string;
  link?: {
    text?: string;
    url: string;
  };
  btn?: {
    text: string;
    fn: Function;
  };
}
