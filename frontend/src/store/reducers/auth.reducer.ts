import { User } from '../../models/user.model';
import { userService } from '../../services/user.service'

const initialState: {
    loggedinUser: User | null,
} = {
    loggedinUser: userService.getLoggedinUser(),
}

export function userReducer(state = initialState, action: { type: string; user: User; }) {
    switch (action.type) {
        case 'SET_LOGGEDIN_USER':
            return { loggedinUser: action.user }
        case 'LOGOUT':
            return { loggedinUser: null }
        default:
            return state
    }
}