import { ErrorMsg } from "../../Msg/ErrorMsg/ErrorMsg";
import { SpinnerLoader } from "../../Loaders/SpinnerLoader/SpinnerLoader";
import "./AsyncList.scss";
import { Empty } from "../Empty/Empty";

type AsyncListProps<T> = {
  render: (item: T, idx: number, arr: T[]) => JSX.Element;
  items: T[];
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isEmpty: boolean;
  entityName: string;
  className?: string;
};

export const AsyncList = <T,>({
  render,
  items,
  isLoading,
  isSuccess,
  isError,
  isEmpty,
  entityName,
  className,
}: AsyncListProps<T>) => {
  return (
    <div className={`list-container ${className}`}>
      {isLoading && <SpinnerLoader />}
      {isSuccess && !isEmpty && (
        <div className={`list ${className}`}>
          {items.map((item, idx, arr) => render(item, idx, arr))}
        </div>
      )}
      {isSuccess && isEmpty && <Empty entityName={entityName} />}
      {isError && <ErrorMsg msg={`Couldn't get ${entityName}. Please try again later.`} />}
    </div>
  );
};
