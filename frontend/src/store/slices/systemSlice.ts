import { AppThunk } from "./../store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserMsg } from "../../../../shared/interfaces/system.interface";

interface SystemState {
  isPageLoading: boolean;
  userMsg: UserMsg | null;
}

const initialState: SystemState = {
  isPageLoading: true,
  userMsg: null,
};

const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    setIsPageLoading(state, action: PayloadAction<boolean>) {
      state.isPageLoading = action.payload;
    },
    setUserMsg(state, action: PayloadAction<UserMsg | null>) {
      state.userMsg = action.payload;
    },
  },
});

export const { setIsPageLoading, setUserMsg } = systemSlice.actions;

export function displayUserMsg(userMsg: UserMsg): AppThunk {
  return async dispatch => {
    dispatch(setUserMsg(userMsg));
    await new Promise(resolve => setTimeout(resolve, 3000));
    dispatch(setUserMsg(null));
  };
}

export default systemSlice.reducer;
