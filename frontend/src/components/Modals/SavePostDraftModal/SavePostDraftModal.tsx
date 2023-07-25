import { FC } from "react";
import "./SavePostDraftModal.scss";
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
  const btns = [
    {
      title: "Save",
      className: "btn-save-post-draft",
      onClick: onSavePostDraft,
    },
    {
      title: "Discard",
      className: "btn-discard-post-draft",
      onClick: discardPostThread,
    },
  ];

  return (
    <Modal
      className="save-post-draft"
      onClickMainScreen={onCloseModal}
      mainScreenMode="dark"
      mainScreenZIndex={3000}
    >
      <div className="save-post-draft-header">
        <span className="save-post-draft-title">Save Chirp?</span>
        <p className="save-post-draft-description">
          You can save this to send later from your drafts.
        </p>
      </div>

      <div className="save-post-draft-btns-container">
        {btns.map(btn => (
          <button key={btn.title} className={btn.className} onClick={btn.onClick}>
            <span>{btn.title}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
};
