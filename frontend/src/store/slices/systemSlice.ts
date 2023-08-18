import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SystemState {
  isPageLoading: boolean;
}

const initialState: SystemState = {
  isPageLoading: true,
};

const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    setIsPageLoading(state, action: PayloadAction<boolean>) {
      state.isPageLoading = action.payload;
    },
  },
});

export const { setIsPageLoading } = systemSlice.actions;

export default systemSlice.reducer;
