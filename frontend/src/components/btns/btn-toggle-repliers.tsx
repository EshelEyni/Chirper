import { FC, useRef, useState } from "react";
import { RepliersPickerModal } from "../modals/repliers-picker-modal";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { FaGlobeAmericas } from "react-icons/fa";
import { NewPostType } from "../../store/reducers/post.reducer";

export const BtnToggleRepliers: FC = () => {
  const {
    newPost,
    sideBarNewPost,
    newPostType,
  }: { newPost: NewPost; sideBarNewPost: NewPost; newPostType: NewPostType } = useSelector(
    (state: RootState) => state.postModule
  );

  const newPostTypeRef = useRef(newPostType);
  const currPost = newPostTypeRef.current === "side-bar-post" ? sideBarNewPost : newPost;

  const [isRepliersOpen, setIsRepliersOpen] = useState<boolean>(false);
  const toggleModal = () => {
    setIsRepliersOpen(!isRepliersOpen);
  };

  const setTitle = (value: string) => {
    if (value === "everyone") return "Everyone";
    if (value === "followed") return "Only people you follow";
    if (value === "mentioned") return "Only people you mentioned";
  };

  return (
    <div className="btn-toggle-repliers-container">
      <button className="btn-toggle-repliers" onClick={() => toggleModal()}>
        <FaGlobeAmericas />
        <span>{setTitle(currPost.repliersType)}</span>
        can reply
      </button>
      {isRepliersOpen && <RepliersPickerModal toggleModal={toggleModal} />}
    </div>
  );
};
