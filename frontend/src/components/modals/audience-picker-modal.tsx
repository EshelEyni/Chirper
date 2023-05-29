import { FC, Fragment } from "react";
import { GoGlobe } from "react-icons/go";
import { ReactComponent as ChirperCircleIcon } from "../../assets/svg/chirper-circle-solid.svg";
import { AiOutlineCheck } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store/types";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { RootState } from "../../store/store";
import { updateCurrNewPost } from "../../store/actions/post.actions";

interface AudiencePickerModalProps {
  currNewPost: NewPost;
  toggleModal: (type: string) => void;
}

export const AudiencePickerModal: FC<AudiencePickerModalProps> = ({ currNewPost, toggleModal }) => {
  const { newPostType } = useSelector((state: RootState) => state.postModule.newPostState);
  const dispatch: AppDispatch = useDispatch();
  const iconClassName = "picker-modal-option-icon";
  const audinceOptions = [
    {
      title: "Everyone",
      icon: <GoGlobe className={iconClassName} />,
      value: "everyone",
      isSelected: currNewPost.audience === "everyone",
    },
    {
      title: "Chirper Circle",
      icon: <ChirperCircleIcon className={iconClassName} />,
      value: "chirper-circle",
      isSelected: currNewPost.audience === "chirper-circle",
    },
  ];

  const onOptionClick = (option: string) => {
    dispatch(updateCurrNewPost({ ...currNewPost, audience: option }, newPostType));
    toggleModal("audience");
  };

  return (
    <Fragment>
      <div className="main-screen" onClick={() => toggleModal("audience")} />
      <section className="picker-modal">
        <h1 className="picker-modal-title">Choose audience</h1>
        <div className="picker-modal-options">
          {audinceOptions.map(option => (
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
    </Fragment>
  );
};
