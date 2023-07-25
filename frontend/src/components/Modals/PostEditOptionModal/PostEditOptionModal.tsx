import { FC } from "react";
import "./PostEditOptionModal.scss";
import { PostEditOption } from "../../../types/app.types";
import { Modal } from "../Modal/Modal";
import { PostEditOptionList } from "./PostEditOptionList/PostEditOptionList";

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
  className = "",
}) => {
  return (
    <Modal className={`post-edit-option ${className}`} onClickMainScreen={toggleModal}>
      <h1 className="post-edit-option-title">{title}</h1>
      <PostEditOptionList options={options} onOptionClick={onOptionClick} />
    </Modal>
  );
};
