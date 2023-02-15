import { User } from '../../models/user.model';
import { userService } from '../../services/user.service'

const demoUser: User = {
    _id: 'u101',
    username: 'demo',
    password: '123',
    fullname: 'Demo User',
    imgUrl: 'https://res.cloudinary.com/dng9sfzqt/image/upload/v1674947349/iygilawrooz36soschcq.png',
    isAdmin: false,
    createdAt: '2021-08-01T12:00:00.000Z',
    updatedAt: '2021-08-01T12:00:00.000Z',
}

const initialState: {
    loggedinUser: User | null,
} = {
    loggedinUser: userService.getLoggedinUser() || demoUser,
}

export function authReducer(state = initialState, action: { type: string; user: User; }) {
    switch (action.type) {
        case 'SET_LOGGEDIN_USER':
            return { loggedinUser: action.user }
        case 'LOGOUT':
            return { loggedinUser: null }
        default:
            return state
    }
}