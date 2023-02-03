import { storageService } from './storage.service'

function getLoggedinUser() {
    return storageService.get('loggedinUser')
}


export const userService = {
    getLoggedinUser,
}