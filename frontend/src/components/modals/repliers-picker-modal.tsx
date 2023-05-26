import { FC, Fragment, useRef } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { FaAt, FaGlobeAmericas, FaUserCheck } from "react-icons/fa";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AppDispatch } from "../../store/types";
import { setNewPost } from "../../store/actions/post.actions";
import { NewPostType } from "../../store/reducers/post.reducer";

interface RepliersPickerModalProps {
  toggleModal: (type: string) => void;
}

export const RepliersPickerModal: FC<RepliersPickerModalProps> = ({ toggleModal }) => {
  const {
    newPost,
    sideBarNewPost,
    newPostType,
  }: { newPost: NewPost; sideBarNewPost: NewPost; newPostType: NewPostType } = useSelector(
    (state: RootState) => state.postModule
  );

  const newPostTypeRef = useRef(newPostType);
  const currPost = newPostTypeRef.current === "side-bar-post" ? sideBarNewPost : newPost;

  const dispatch: AppDispatch = useDispatch();

  const iconClassName = "picker-modal-option-icon";

  const replierOptions = [
    {
      title: "Everyone",
      icon: <FaGlobeAmericas className={iconClassName} />,
      value: "everyone",
      isSelected: currPost.repliersType === "everyone",
    },
    {
      title: "Only people you follow",
      icon: <FaUserCheck className={iconClassName} />,
      value: "followed",
      isSelected: currPost.repliersType === "followed",
    },
    {
      title: "Only people you mentioned",
      icon: <FaAt className={iconClassName} />,
      value: "mentioned",
      isSelected: currPost.repliersType === "mentioned",
    },
  ];

  const onClickOption = (value: string) => {
    dispatch(setNewPost({ ...currPost, repliersType: value }, newPostType));
    toggleModal("repliers");
  };

  return (
    <Fragment>
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
    </Fragment>
  );
};
