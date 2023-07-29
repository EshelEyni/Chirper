import { FC, useState } from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import { GoGlobe } from "react-icons/go";
import { ReactComponent as ChirperCircleIcon } from "../../../assets/svg/chirper-circle-solid.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { PostEditOptionModal } from "../../Modals/PostEditOptionModal/PostEditOptionModal";
import { PostEditOption } from "../../../types/app.types";
import { usePostEdit } from "../../Post/PostEdit/PostEditContext";

export const BtnToggleAudience: FC = () => {
  const [isAudienceOpen, setIsAudienceOpen] = useState<boolean>(false);

  const { newPostType } = useSelector((state: RootState) => state.newPostModule);
  const dispatch: AppDispatch = useDispatch();

  const { currNewPost } = usePostEdit();
  if (!currNewPost) return null;
  const title = getTitle(currNewPost.audience);

  const options: PostEditOption[] = [
    {
      title: "Everyone",
      icon: <GoGlobe />,
      value: "everyone",
      isSelected: currNewPost.audience === "everyone",
    },
    {
      title: "Chirper Circle",
      icon: <ChirperCircleIcon />,
      value: "chirper-circle",
      isSelected: currNewPost.audience === "chirper-circle",
    },
  ];

  function toggleModal() {
    setIsAudienceOpen(!isAudienceOpen);
  }

  function getTitle(value: string) {
    switch (value) {
      case "everyone":
        return "Everyone";
      case "chirper-circle":
        return "Chirper Circle";
      default:
        return "Everyone";
    }
  }

  function onOptionClick(option: string) {
    if (!currNewPost) return;
    dispatch(updateCurrNewPost({ ...currNewPost, audience: option }, newPostType));
    toggleModal();
  }

  return (
    <div className="btn-toggle-audience-cotnainer">
      <button className="btn-toggle-audience" onClick={() => toggleModal()}>
        <span>{title}</span>
        <IoChevronDownOutline />
      </button>
      {isAudienceOpen && (
        <PostEditOptionModal
          title="Choose audience"
          options={options}
          onOptionClick={onOptionClick}
          toggleModal={toggleModal}
        />
      )}
    </div>
  );
};
