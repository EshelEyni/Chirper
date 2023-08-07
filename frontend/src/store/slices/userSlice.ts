import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../../../shared/interfaces/user.interface";

interface UserState {
  users: User[];
  user: User | null;
}

const initialState: UserState = {
  users: [],
  user: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    removeUser(state, action: PayloadAction<string>) {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
});

export const { setUsers, setUser, removeUser, updateUser } = userSlice.actions;

export default userSlice.reducer;
