import { FC } from "react";
import "./PostEditOption.scss";
import { PostEditOption as TypeOfPostEditOption } from "../../../../types/app.types";
import { AiOutlineCheck } from "react-icons/ai";
import "./PostEditOption.scss";

type PostEditOptionProps = {
  option: TypeOfPostEditOption;
};

export const PostEditOption: FC<PostEditOptionProps> = ({ option }) => {
  return (
    <button key={option.title} className="post-edit-option-preview">
      <div className="post-edit-option-main-content">
        <div className="post-edit-option-icon-container">{option.icon}</div>
        <div className="post-edit-option-text">{option.title}</div>
      </div>
      {option.isSelected && <AiOutlineCheck className="check-icon" />}
    </button>
  );
};
