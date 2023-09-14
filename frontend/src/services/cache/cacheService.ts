import { CachedData } from "../../types/app";
import localForageService from "../localForage/localForageService";

function set<T>(cacheKey: string, data: T): void {
  localForageService.set(cacheKey, { data, cachedAt: Date.now() });
}

async function get<T>(cacheKey: string, expiryTimeInMinutes: number): Promise<T | null> {
  const expiryTimeInMillis = 1000 * 60 * expiryTimeInMinutes;
  const cachedDataWithTimestamp = (await localForageService.get(
    cacheKey
  )) as unknown as CachedData<T>;
  if (!cachedDataWithTimestamp) return null;
  const { cachedAt, data } = cachedDataWithTimestamp;
  const currentTime = Date.now();
  const elapsedTimeSinceCaching = currentTime - cachedAt;
  if (elapsedTimeSinceCaching < expiryTimeInMillis) return data;
  localForageService.clear(cacheKey);
  return null;
}

export default { get, set };
