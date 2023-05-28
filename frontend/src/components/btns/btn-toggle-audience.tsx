import { FC, useState } from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import { AudiencePickerModal } from "../modals/audience-picker-modal";
import { NewPost } from "../../../../shared/interfaces/post.interface";

type BtnToggleAudienceProps = {
  currNewPost: NewPost;
};

export const BtnToggleAudience: FC<BtnToggleAudienceProps> = ({ currNewPost }) => {
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
        <span>{setTitle(currNewPost.audience)}</span>
        <IoChevronDownOutline />
      </button>
      {isAudienceOpen && (
        <AudiencePickerModal currNewPost={currNewPost} toggleModal={toggleModal} />
      )}
    </div>
  );
};
