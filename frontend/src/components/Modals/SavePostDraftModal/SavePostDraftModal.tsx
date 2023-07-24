import { FC } from "react";
import "./SavePostDraftModal.scss";
import { MainScreen } from "../../App/MainScreen/MainScreen";
import { Modal } from "../Modal/Modal";

type SavePostDraftModalProps = {
  onCloseModal: () => void;
  onSavePostDraft: () => void;
  discardPostThread: () => void;
};

export const SavePostDraftModal: FC<SavePostDraftModalProps> = ({
  onCloseModal,
  onSavePostDraft,
  discardPostThread,
}) => {
  return (
    <Modal
      className="save-post-draft-modal"
      onClickMainScreen={onCloseModal}
      mainScreenMode="dark"
      mainScreenZIndex={3000}
    >
      <div className="save-post-draft-modal-header">
        <span className="save-post-draft-title">Save Chirp?</span>
        <p className="save-post-draft-description">
          You can save this to send later from your drafts.
        </p>
      </div>

      <div className="save-post-draft-modal-btns-container">
        <button className="btn-save-post-draft" onClick={onSavePostDraft}>
          <span>Save</span>
        </button>
        <button className="btn-discard-post-draft" onClick={discardPostThread}>
          <span>Discard</span>
        </button>
      </div>
    </Modal>
  );
};
