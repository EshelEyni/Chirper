import { useState } from "react";
import { postSettings } from "../post/post-edit";
import { IoChevronDownOutline } from "react-icons/io5";
import { AudiencePickerModal } from "../modals/audience-picker-modal";

interface BtnToggleAudienceProps {
  postSettings: postSettings;
  setPostSettings: React.Dispatch<React.SetStateAction<postSettings>>;
}

export const BtnToggleAudience: React.FC<BtnToggleAudienceProps> = ({
  postSettings,
  setPostSettings,
}) => {
  const [isAudienceOpen, setIsAudienceOpen] = useState<boolean>(false);
  const toggleModal = () => {
    setIsAudienceOpen(!isAudienceOpen);
  };

  return (
    <div className="btn-toggle-audience-cotnainer">
      <button className="btn-toggle-audience" onClick={() => toggleModal()}>
        <span>{postSettings.audience.title}</span>
        <IoChevronDownOutline />
      </button>
      {isAudienceOpen && (
        <AudiencePickerModal
          postSettings={postSettings}
          SetPostSettings={setPostSettings}
          toggleModal={toggleModal}
        />
      )}
    </div>
  );
};
