import { User } from "../../../../shared/interfaces/user.interface";
import { userService } from "../../services/user.service";

const demoUser: User = {
  _id: "64424cf7fb00fb179e797a3f",
  username: "demo",
  password: "123",
  fullname: "Demo User",
  imgUrl:
    "https://res.cloudinary.com/dng9sfzqt/image/upload/v1674947349/iygilawrooz36soschcq.png",
  isAdmin: false,
  isVerified: true,
  createdAt: 1620000000000,
};

const initialState: {
  loggedinUser: User | null;
} = {
  loggedinUser: userService.getLoggedinUser() || demoUser,
};

export function authReducer(
  state = initialState,
  action: { type: string; user: User }
) {
  switch (action.type) {
    case "SET_LOGGEDIN_USER":
      return { loggedinUser: action.user };
    case "LOGOUT":
      return { loggedinUser: null };
    default:
      return state;
  }
}
