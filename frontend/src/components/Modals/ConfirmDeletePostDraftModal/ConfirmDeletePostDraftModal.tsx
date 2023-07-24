import { FC } from "react";
import "./ConfirmDeletePostDraftModal.scss";
import { Modal } from "../Modal/Modal";

type ConfirmDeleteModalProps = {
  onCloseModal: () => void;
  discardPostThread: () => void;
};

export const ConfirmDeletePostDraftModal: FC<ConfirmDeleteModalProps> = ({
  onCloseModal,
  discardPostThread,
}) => {
  return (
    <Modal
      className="confirm-delete-post-draft"
      onClickMainScreen={onCloseModal}
      mainScreenMode="dark"
      mainScreenZIndex={3000}
    >
      <div className="confirm-delete-post-draft-header">
        <span className="confirm-delete-post-draft-title">Discard thread?</span>
        <p className="save-post-draft-description">
          This can’t be undone and you’ll lose your draft.
        </p>
      </div>

      <div className="confirm-delete-post-draft-btns-container">
        <button className="btn-discard-post-draft" onClick={discardPostThread}>
          <span>Discard</span>
        </button>
        <button className="btn-close-modal" onClick={onCloseModal}>
          <span>Cancel</span>
        </button>
      </div>
    </Modal>
  );
};
