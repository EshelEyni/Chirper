import { AsyncLocalStorage } from "async_hooks";
import { alStoreType } from "../middlewares/setupAls/setupAls.middleware";
const asyncLocalStorage = new AsyncLocalStorage();

function getLoggedInUserId(): string {
  return (asyncLocalStorage.getStore() as alStoreType)?.loggedInUserId ?? "";
}

export { asyncLocalStorage, getLoggedInUserId };
