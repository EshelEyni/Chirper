export const storageService = {
    get,
    set
}

function set(entityType: string, entities:string) {
    localStorage.setItem(entityType, JSON.stringify(entities))
}

function get(key:string) {
    let val = localStorage.getItem(key)
    if (!val) return null
    return JSON.parse(val)
}