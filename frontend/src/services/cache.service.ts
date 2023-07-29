import storageService from "./storage.service";

function set(cacheKey: string, data: any) {
  storageService.set(cacheKey, data);
}

function get(cacheKey: string, expiryTimeInMinutes: number) {
  const expiryTimeInMillis = 1000 * 60 * expiryTimeInMinutes;
  const cachedDataWithTimestamp = storageService.get(cacheKey);
  if (!cachedDataWithTimestamp) return null;
  const { cachedAt, data } = cachedDataWithTimestamp;
  const currentTime = Date.now();
  const elapsedTimeSinceCaching = currentTime - cachedAt;
  if (elapsedTimeSinceCaching < expiryTimeInMillis) return data;
  storageService.clear(cacheKey);
  return null;
}

export default { get, set };
