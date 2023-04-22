interface SystemState {
  isPageLoading: boolean;
  isSideBarShown: boolean;
  userMsg: string;
}

const initialState: SystemState = {
  isPageLoading: true,
  isSideBarShown: true,
  userMsg: "",
};

export function systemReducer(
  state = initialState,
  action: {
    type: string;
    isPageLoading?: boolean;
    isSideBarShown?: boolean;
    userMsg?: string;
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
