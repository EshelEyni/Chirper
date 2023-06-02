import { storageService } from "./storage.service";

function set(cacheKey: string, data: any) {
  storageService.set(cacheKey, data);
}

function get(cacheKey: string, expiryTimeInMinutes: number) {
  const expiryTimeInMillis = 1000 * 60 * expiryTimeInMinutes;
  const cachedDataWithTimestamp = storageService.get(cacheKey);
  if (!cachedDataWithTimestamp) return null;
  const { timestamp, data } = cachedDataWithTimestamp;
  const currentTime = Date.now();
  const elapsedTimeSinceCaching = currentTime - timestamp;
  if (elapsedTimeSinceCaching < expiryTimeInMillis) {
    return data;
  }
  return null;
}

export const cacheService = {
  get,
  set,
};
