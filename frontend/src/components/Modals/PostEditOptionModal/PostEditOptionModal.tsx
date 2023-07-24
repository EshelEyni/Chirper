import { FC } from "react";
import "./PostEditOptionModal.scss";
import { PostEditOption } from "../../../types/app.types";
import { AiOutlineCheck } from "react-icons/ai";
import { Modal } from "../Modal/Modal";

type PostEditOptionModalProps = {
  title: string;
  options: PostEditOption[];
  onOptionClick: (value: string) => void;
  toggleModal: () => void;
  className?: string;
};

export const PostEditOptionModal: FC<PostEditOptionModalProps> = ({
  title,
  options,
  onOptionClick,
  toggleModal,
  className,
}) => {
  return (
    <Modal className={`post-edit-option ${className}`} onClickMainScreen={toggleModal}>
      <h1 className="post-edit-option-title">{title}</h1>
      <div className="post-edit-option-options">
        {options.map(option => (
          <div
            key={option.title}
            className="post-edit-option-option"
            onClick={() => onOptionClick(option.value)}
          >
            <div className="post-edit-option-option-main-content">
              <div className="post-edit-option-option-icon-container">{option.icon}</div>
              <div className="post-edit-option-option-text">{option.title}</div>
            </div>
            {option.isSelected && <AiOutlineCheck className="check-icon" />}
          </div>
        ))}
      </div>
    </Modal>
  );
};
