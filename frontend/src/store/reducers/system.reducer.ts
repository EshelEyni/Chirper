// import { UserMsg } from "../../../../shared/interfaces/system.interface";

// interface SystemState {
//   isPageLoading: boolean;
//   userMsg: UserMsg | null;
// }

// const initialState: SystemState = {
//   isPageLoading: true,
//   userMsg: null,
// };

// export function systemReducer(
//   state = initialState,
//   action: {
//     type: string;
//     isPageLoading: boolean;
//     userMsg: UserMsg;
//   }
// ) {
//   switch (action.type) {
//     case "SET_IS_PAGE_LOADING":
//       return { ...state, isPageLoading: action.isPageLoading };
//     case "SET_USER_MSG": {
//       return { ...state, userMsg: action.userMsg };
//     }
//     default:
//       return state;
//   }
// }
