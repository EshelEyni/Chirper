import storageService from "../storageService";

function set<T>(cacheKey: string, data: T): void {
  storageService.set(cacheKey, data);
}

function get<T>(cacheKey: string, expiryTimeInMinutes: number): T | null {
  const expiryTimeInMillis = 1000 * 60 * expiryTimeInMinutes;
  const cachedDataWithTimestamp = storageService.get(cacheKey);
  if (!cachedDataWithTimestamp) return null;
  const { cachedAt, data } = cachedDataWithTimestamp;
  const currentTime = Date.now();
  const elapsedTimeSinceCaching = currentTime - cachedAt;
  if (elapsedTimeSinceCaching < expiryTimeInMillis) return data as T;
  storageService.clear(cacheKey);
  return null;
}

export default { get, set };
