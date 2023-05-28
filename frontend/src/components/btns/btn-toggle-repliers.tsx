import { FC, useState } from "react";
import { RepliersPickerModal } from "../modals/repliers-picker-modal";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { FaGlobeAmericas } from "react-icons/fa";

type BtnToggleRepliersProps = {
  currNewPost: NewPost;
};

export const BtnToggleRepliers: FC<BtnToggleRepliersProps> = ({ currNewPost }) => {
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
        <span>{setTitle(currNewPost.repliersType)}</span>
        can reply
      </button>
      {isRepliersOpen && (
        <RepliersPickerModal currNewPost={currNewPost} toggleModal={toggleModal} />
      )}
    </div>
  );
};
