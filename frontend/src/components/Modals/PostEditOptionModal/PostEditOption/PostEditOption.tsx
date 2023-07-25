import { FC } from "react";
import "./PostEditOption.scss";
import { PostEditOption as TypeOfPostEditOption } from "../../../../types/app.types";
import { AiOutlineCheck } from "react-icons/ai";
import "./PostEditOption.scss";

type PostEditOptionProps = {
  option: TypeOfPostEditOption;
  onOptionClick: (value: string) => void;
};

export const PostEditOption: FC<PostEditOptionProps> = ({ option, onOptionClick }) => {
  return (
    <li
      key={option.title}
      className="post-edit-option-preview"
      onClick={() => onOptionClick(option.value)}
    >
      <div className="post-edit-option-main-content">
        <div className="post-edit-option-icon-container">{option.icon}</div>
        <div className="post-edit-option-text">{option.title}</div>
      </div>
      {option.isSelected && <AiOutlineCheck className="check-icon" />}
    </li>
  );
};
