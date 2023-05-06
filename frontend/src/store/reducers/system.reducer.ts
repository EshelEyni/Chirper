import { UserMsg } from "../../../../shared/interfaces/system.interface";

interface SystemState {
  isPageLoading: boolean;
  isSideBarShown: boolean;
  userMsg: UserMsg | null;
}

const initialState: SystemState = {
  isPageLoading: true,
  isSideBarShown: true,
  userMsg: null,
};

export function systemReducer(
  state = initialState,
  action: {
    type: string;
    isPageLoading: boolean;
    isSideBarShown: boolean;
    userMsg: UserMsg;
  }
) {
  switch (action.type) {
    case "SET_IS_PAGE_LOADING":
      return { ...state, isPageLoading: action.isPageLoading };
    case "SET_IS_SIDEBAR_SHOWN":
      return { ...state, isSideBarShown: action.isSideBarShown };
    case "SET_USER_MSG":
      return { ...state, userMsg: action.userMsg };

    default:
      return state;
  }
}
