import { FC } from "react";
import "./PostEditOptionModal.scss";
import { PostEditOption } from "../../../types/app.types";
import { AiOutlineCheck } from "react-icons/ai";

type PostEditOptionModalProps = {
  title: string;
  options: PostEditOption[];
  onOptionClick: (value: string) => void;
  className?: string;
};

export const PostEditOptionModal: FC<PostEditOptionModalProps> = ({
  title,
  options,
  onOptionClick,
  className,
}) => {
  return (
    <section className={`picker-modal ${className}`}>
      <h1 className="picker-modal-title">{title}</h1>
      <div className="picker-modal-options">
        {options.map(option => (
          <div
            key={option.title}
            className="picker-modal-option"
            onClick={() => onOptionClick(option.value)}
          >
            <div className="picker-modal-option-main-content">
              <div className="picker-modal-option-icon-container">{option.icon}</div>
              <div className="picker-modal-option-text">{option.title}</div>
            </div>
            {option.isSelected && <AiOutlineCheck className="check-icon" />}
          </div>
        ))}
      </div>
    </section>
  );
};
