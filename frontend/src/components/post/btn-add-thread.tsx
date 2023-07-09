import { FC } from "react";
import { AiOutlinePlus } from "react-icons/ai";

type BtnAddThreadProps = {
  isDisabled: boolean;
  onAddPostToThread: () => void;
};

export const BtnAddThread: FC<BtnAddThreadProps> = ({
  isDisabled: isAddingPostToThreadDisabled,
  onAddPostToThread,
}) => {
  return (
    <button
      className={"btn-add-thread" + (isAddingPostToThreadDisabled ? " disabled" : "")}
      onClick={onAddPostToThread}
      disabled={isAddingPostToThreadDisabled}
    >
      <AiOutlinePlus className="btn-add-thread-icon" />
    </button>
  );
};
