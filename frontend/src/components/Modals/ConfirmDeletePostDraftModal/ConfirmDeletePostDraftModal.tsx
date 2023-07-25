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
  const btns = [
    {
      title: "Discard",
      className: "btn-discard-post-draft",
      onClick: discardPostThread,
    },
    {
      title: "Cancel",
      className: "btn-close-modal",
      onClick: onCloseModal,
    },
  ];

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
        {btns.map(btn => (
          <button key={btn.title} className={btn.className} onClick={btn.onClick}>
            <span>{btn.title}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
};
