function set(entityType: string, entities: any) {
  localStorage.setItem(entityType, JSON.stringify(entities));
}

function get(key: string) {
  const val = localStorage.getItem(key);
  if (!val) return null;
  return JSON.parse(val);
}

export const storageService = {
  get,
  set,
};
