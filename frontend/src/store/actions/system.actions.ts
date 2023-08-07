// import { ThunkAction } from "redux-thunk";
// import { RootState } from "../store";
// import { AnyAction } from "redux";
// import { UserMsg } from "../../../../shared/interfaces/system.interface";

// export function setIsPageLoading(
//   isPageLoading: boolean
// ): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
//   return async dispatch => {
//     try {
//       dispatch({ type: "SET_IS_PAGE_LOADING", isPageLoading });
//     } catch (err) {
//       console.log("PostActions: err in getPosts", err);
//     }
//   };
// }

// export function setUserMsg(
//   userMsg: UserMsg
// ): ThunkAction<Promise<void>, RootState, undefined, AnyAction> {
//   return async dispatch => {
//     try {
//       dispatch({ type: "SET_USER_MSG", userMsg });
//       setTimeout(() => {
//         dispatch({ type: "SET_USER_MSG", userMsg: null });
//       }, 3000);
//     } catch (err) {
//       console.log("PostActions: err in getPosts", err);
//     }
//   };
// }
