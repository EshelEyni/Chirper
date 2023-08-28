// import { FC } from "react";
// import { ErrorMsg } from "../../Msg/ErrorMsg/ErrorMsg";
// import { SpinnerLoader } from "../../Loaders/SpinnerLoader/SpinnerLoader";

// type ListContainerProps<T> = {
//   render: (item: T) => JSX.Element;
//   isLoading: boolean;
//   isSuccess: boolean;
//   isError: boolean;
//   isEmpty: boolean;
//   entityName: string;
// };

// export const ListContainer = <T extends unknown>({
//   render,
// //   items,
//   isLoading,
//   isSuccess,
//   isError,
//   isEmpty,
//   entityName,
// }: ListContainerProps<T>) => {
//   return (
//     <div className="list-container">
//       {isLoading && <SpinnerLoader />}
//       {isSuccess && !isEmpty && <div className="list">{render()}</div>}
//       {isSuccess && isEmpty && <p className="no-res-msg">{`no ${entityName} to show`}</p>}
//       {isError && <ErrorMsg msg={`Couldn't get ${entityName}. Please try again later.`} />}
//     </div>
//   );
// };
