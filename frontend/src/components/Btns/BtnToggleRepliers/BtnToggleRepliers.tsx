import { FC, useState } from "react";
import { FaAt, FaGlobeAmericas, FaUserCheck } from "react-icons/fa";
import { PostEditOption } from "../../../types/app.types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { RootState } from "../../../store/store";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { PostEditOptionModal } from "../../Modals/PostEditOptionModal/PostEditOptionModal";
import { usePostEdit } from "../../../contexts/PostEditContext";

export const BtnToggleRepliers: FC = () => {
  const { currNewPost } = usePostEdit();
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);
  const [isRepliersOpen, setIsRepliersOpen] = useState<boolean>(false);
  if (!currNewPost) return null;

  const title = getTitle(currNewPost.repliersType);

  const options: PostEditOption[] = [
    {
      title: "Everyone",
      icon: <FaGlobeAmericas />,
      value: "everyone",
      isSelected: currNewPost.repliersType === "everyone",
    },
    {
      title: "Only people you follow",
      icon: <FaUserCheck />,
      value: "followed",
      isSelected: currNewPost.repliersType === "followed",
    },
    {
      title: "Only people you mentioned",
      icon: <FaAt />,
      value: "mentioned",
      isSelected: currNewPost.repliersType === "mentioned",
    },
  ];

  function toggleModal() {
    setIsRepliersOpen(prevState => !prevState);
  }

  function getTitle(value: string) {
    switch (value) {
      case "everyone":
        return "Everyone";
      case "followed":
        return "Only people you follow";
      case "mentioned":
        return "Only people you mentioned";
      default:
        return "Everyone";
    }
  }

  function onOptionClick(value: string) {
    if (!currNewPost) return;
    dispatch(updateCurrNewPost({ ...currNewPost, repliersType: value }, newPostType));
    toggleModal();
  }

  return (
    <div className="btn-toggle-repliers-container">
      <button className="btn-toggle-repliers" onClick={() => toggleModal()}>
        <FaGlobeAmericas />
        <span>{title}</span>
        can reply
      </button>
      {isRepliersOpen && (
        <PostEditOptionModal
          title="Choose who can reply"
          options={options}
          onOptionClick={onOptionClick}
          toggleModal={toggleModal}
          className="repliers"
        />
      )}
    </div>
  );
};
