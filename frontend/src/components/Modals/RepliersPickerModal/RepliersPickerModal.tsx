import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AiOutlineCheck } from "react-icons/ai";
import { FaAt, FaGlobeAmericas, FaUserCheck } from "react-icons/fa";
import { NewPost } from "../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";

interface RepliersPickerModalProps {
  currNewPost: NewPost;
  toggleModal: (type: string) => void;
}

export const RepliersPickerModal: FC<RepliersPickerModalProps> = ({ currNewPost, toggleModal }) => {
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  const dispatch: AppDispatch = useDispatch();

  const iconClassName = "picker-modal-option-icon";

  const replierOptions = [
    {
      title: "Everyone",
      icon: <FaGlobeAmericas className={iconClassName} />,
      value: "everyone",
      isSelected: currNewPost.repliersType === "everyone",
    },
    {
      title: "Only people you follow",
      icon: <FaUserCheck className={iconClassName} />,
      value: "followed",
      isSelected: currNewPost.repliersType === "followed",
    },
    {
      title: "Only people you mentioned",
      icon: <FaAt className={iconClassName} />,
      value: "mentioned",
      isSelected: currNewPost.repliersType === "mentioned",
    },
  ];

  const onClickOption = (value: string) => {
    dispatch(updateCurrNewPost({ ...currNewPost, repliersType: value }, newPostType));
    toggleModal("repliers");
  };

  return (
    <>
      <div className="main-screen" onClick={() => toggleModal("repliers")} />
      <section className="picker-modal repliers">
        <h1 className="picker-modal-title">Choose who can reply</h1>
        <div className="picker-modal-options">
          {replierOptions.map(option => (
            <div
              key={option.title}
              className="picker-modal-option"
              onClick={() => onClickOption(option.value)}
            >
              <div className="picker-modal-option-main-content">
                <div className="picker-modal-option-icon-container">{option.icon}</div>
                <div className="picker-modal-option-text repliers">{option.title}</div>
              </div>
              {option.isSelected && <AiOutlineCheck className="check-icon" />}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
