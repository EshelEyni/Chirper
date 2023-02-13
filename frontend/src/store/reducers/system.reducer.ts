import { SystemState } from "../../models/reducer";

const initialState: SystemState = {
  isPageLoading: false,
};

export function systemReducer(
  state = initialState,
  action: {
    type: string;
    isPageLoading: boolean;
  }
) {
  switch (action.type) {
    case "SET_IS_PAGE_LOADING":
      return { ...state, isPageLoading: action.isPageLoading };

    default:
      return state;
  }
}
