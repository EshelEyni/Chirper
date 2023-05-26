import { FC, useRef, useState } from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import { AudiencePickerModal } from "../modals/audience-picker-modal";
import { useSelector } from "react-redux";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { RootState } from "../../store/store";
import { NewPostType } from "../../store/reducers/post.reducer";

export const BtnToggleAudience: FC = () => {
  const {
    newPost,
    sideBarNewPost,
    newPostType,
  }: { newPost: NewPost; sideBarNewPost: NewPost; newPostType: NewPostType } = useSelector(
    (state: RootState) => state.postModule
  );

  const newPostTypeRef = useRef(newPostType);
  const currPost = newPostTypeRef.current === "side-bar-post" ? sideBarNewPost : newPost;

  const [isAudienceOpen, setIsAudienceOpen] = useState<boolean>(false);

  const toggleModal = () => {
    setIsAudienceOpen(!isAudienceOpen);
  };

  const setTitle = (value: string) => {
    if (value === "everyone") return "Everyone";
    if (value === "chirper-circle") return "Chirper Circle";
  };

  return (
    <div className="btn-toggle-audience-cotnainer">
      <button className="btn-toggle-audience" onClick={() => toggleModal()}>
        <span>{setTitle(currPost.audience)}</span>
        <IoChevronDownOutline />
      </button>
      {isAudienceOpen && <AudiencePickerModal toggleModal={toggleModal} />}
    </div>
  );
};
