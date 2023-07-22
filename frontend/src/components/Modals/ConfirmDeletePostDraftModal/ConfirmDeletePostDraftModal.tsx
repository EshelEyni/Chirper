import { FC } from "react";
import "./ConfirmDeletePostDraftModal.scss";
import { MainScreen } from "../../App/MainScreen/MainScreen";

type ConfirmDeleteModalProps = {
  onCloseModal: () => void;
  discardPostThread: () => void;
};

export const ConfirmDeletePostDraftModal: FC<ConfirmDeleteModalProps> = ({
  onCloseModal,
  discardPostThread,
}) => {
  return (
    <>
      <MainScreen onClickFn={onCloseModal} mode="dark" zIndex={3000} />
      <section className="confirm-delete-post-draft-modal">
        <div className="confirm-delete-post-draft-modal-header">
          <span className="confirm-delete-post-draft-title">Discard thread?</span>
          <p className="save-post-draft-description">
            This can’t be undone and you’ll lose your draft.
          </p>
        </div>

        <div className="confirm-delete-post-draft-modal-btns-container">
          <button className="btn-discard-post-draft" onClick={discardPostThread}>
            <span>Discard</span>
          </button>
          <button className="btn-close-modal" onClick={onCloseModal}>
            <span>Cancel</span>
          </button>
        </div>
      </section>
    </>
  );
};
