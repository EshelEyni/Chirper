import { User } from "../../models/user.model";

const initialState: {
  users: User[];
  user: User | null;
  userMsg: string | null;
} = {
  users: [],
  user: null,
  userMsg: null,
};

export function userReducer(
  state = initialState,
  action: {
    type: string;
    users: User[];
    user: User;
    userId: string;
    updatedUser: User;
    msg: any;
  }
) {
  switch (action.type) {
    case "SET_USERS":
      return { ...state, users: action.users };
    case "SET_USER":
      return { ...state, user: action.user };
    case "REMOVE_USER":
      return {
        ...state,
        users: state.users.filter((user) => user._id !== action.userId),
      };
    case "UPDATE_USER":
      return { ...state, loggedinUser: action.updatedUser };
    case "UPDATE_WATCHED_USER":
      return { ...state, watchedUser: action.updatedUser };
    case "SET_USER_MSG":
      return { ...state, userMsg: action.msg };
    default:
      return state;
  }
}
