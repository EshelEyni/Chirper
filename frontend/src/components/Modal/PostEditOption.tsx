import { FC } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import "./PostEditOption.scss";

type PostEditOptionProps = {
  title: string;
  icon: JSX.Element;
  isSelected: boolean;
};

export const PostEditOption: FC<PostEditOptionProps> = ({ title, icon, isSelected }) => {
  return (
    <button key={title} className="post-edit-option-preview">
      <div className="post-edit-option-main-content">
        <div className="post-edit-option-icon-container">{icon}</div>
        <div className="post-edit-option-text">{title}</div>
      </div>
      {isSelected && <AiOutlineCheck className="check-icon" />}
    </button>
  );
};
