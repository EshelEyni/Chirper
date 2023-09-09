import { AsyncLocalStorage } from "async_hooks";
import { alStoreType } from "../types/App";
const asyncLocalStorage = new AsyncLocalStorage();

function getLoggedInUserIdFromReq(): string {
  return (asyncLocalStorage.getStore() as alStoreType)?.loggedInUserId ?? "";
}

export { asyncLocalStorage, getLoggedInUserIdFromReq };
