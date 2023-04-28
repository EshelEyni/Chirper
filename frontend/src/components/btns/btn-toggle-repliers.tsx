import { useState } from "react";
import { RepliersPickerModal } from "../modals/repliers-picker-modal";
import { postSettings } from "../post/post-edit";

interface BtnToggleRepliersProps {
    postSettings: postSettings;
    setPostSettings: React.Dispatch<React.SetStateAction<postSettings>>;
}
export const BtnToggleRepliers: React.FC<BtnToggleRepliersProps> = ({
    postSettings,
    setPostSettings,
}) => {

    const [isRepliersOpen, setIsRepliersOpen] = useState<boolean>(false);
    const toggleModal = (type: string) => {
        setIsRepliersOpen(!isRepliersOpen);
    };

    return (
        <div className="btn-toggle-repliers-container">
        <button
          className="btn-toggle-repliers"
          onClick={() => toggleModal("repliers")}
        >
          {postSettings.repliersType.icon}
          <span>{postSettings.repliersType.title}</span>
          can reply
        </button>
        {isRepliersOpen && (
          <RepliersPickerModal
            postSettings={postSettings}
            setPostSettings={setPostSettings}
            toggleModal={toggleModal}
          />
        )}
      </div>
    );
};