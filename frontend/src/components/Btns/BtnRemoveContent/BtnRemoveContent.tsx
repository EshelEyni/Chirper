import { FC } from "react";
import { AiOutlineClose } from "react-icons/ai";
import "./BtnRemoveContent.scss";

type BtnRemoveContentProps = {
  onRemoveContent: () => void;
};

export const BtnRemoveContent: FC<BtnRemoveContentProps> = ({ onRemoveContent }) => {
  return (
    <button
      className="btn-remove-content"
      onClick={onRemoveContent}
      data-testid="btn-remove-content"
    >
      <AiOutlineClose className="remove-content-icon" />
    </button>
  );
};
