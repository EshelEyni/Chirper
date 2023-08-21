import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SystemState {
  isPageLoading: boolean;
  isScrollRedirectActive: boolean;
}

const initialState: SystemState = {
  isPageLoading: true,
  isScrollRedirectActive: true,
};

const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    setIsPageLoading(state, action: PayloadAction<boolean>) {
      state.isPageLoading = action.payload;
    },
    setIsScrollRedirectActive(state, action: PayloadAction<boolean>) {
      state.isScrollRedirectActive = action.payload;
    },
  },
});

export const { setIsPageLoading, setIsScrollRedirectActive } = systemSlice.actions;

export default systemSlice.reducer;
