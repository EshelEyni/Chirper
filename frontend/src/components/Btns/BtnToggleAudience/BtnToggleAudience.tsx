import { FC, useState } from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import { AudiencePickerModal } from "../../Modals/AudiencePickerModal/AudiencePickerModal";
import { NewPost } from "../../../../../shared/interfaces/post.interface";

type BtnToggleAudienceProps = {
  currNewPost: NewPost;
};

export const BtnToggleAudience: FC<BtnToggleAudienceProps> = ({ currNewPost }) => {
  const [isAudienceOpen, setIsAudienceOpen] = useState<boolean>(false);
  const title = getTitle(currNewPost.audience);
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

  return (
    <div className="btn-toggle-audience-cotnainer">
      <button className="btn-toggle-audience" onClick={() => toggleModal()}>
        <span>{title}</span>
        <IoChevronDownOutline />
      </button>
      {isAudienceOpen && (
        <AudiencePickerModal currNewPost={currNewPost} toggleModal={toggleModal} />
      )}
    </div>
  );
};
