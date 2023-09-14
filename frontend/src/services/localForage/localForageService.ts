import localforage from "localforage";

function set<T>(entityType: string, entities: T) {
  localforage.setItem(entityType, entities);
}

async function get(key: string) {
  const val = await localforage.getItem(key);
  return !val ? null : val;
}

function clear(key: string) {
  localforage.removeItem(key);
}

export default { get, set, clear };
