import { FC, useState } from "react";
import { RepliersPickerModal } from "../modals/repliers-picker-modal";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { FaGlobeAmericas } from "react-icons/fa";

type BtnToggleRepliersProps = {
  currNewPost: NewPost;
};

export const BtnToggleRepliers: FC<BtnToggleRepliersProps> = ({ currNewPost }) => {
  const [isRepliersOpen, setIsRepliersOpen] = useState<boolean>(false);
  const title = getTitle(currNewPost.repliersType);
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

  return (
    <div className="btn-toggle-repliers-container">
      <button className="btn-toggle-repliers" onClick={() => toggleModal()}>
        <FaGlobeAmericas />
        <span>{title}</span>
        can reply
      </button>
      {isRepliersOpen && (
        <RepliersPickerModal currNewPost={currNewPost} toggleModal={toggleModal} />
      )}
    </div>
  );
};
