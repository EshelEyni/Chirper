import { FC } from "react";
import "./GifDescriptionModal.scss";
import { Modal } from "../Modal/Modal";
import { Tippy } from "../../App/Tippy/Tippy";
import { createPortal } from "react-dom";

type GifDescriptionModalProps = {
  description: string;
  onToggleDescription: (e: React.MouseEvent) => void;
  isModalAbove: boolean;
};

export const GifDescriptionModal: FC<GifDescriptionModalProps> = ({
  description,
  onToggleDescription,
  isModalAbove,
}) => {
  return createPortal(
    <Modal
      className="gif-description"
      onClickMainScreen={onToggleDescription as () => void}
      style={isModalAbove ? { bottom: "30px" } : { top: "30px" }}
    >
      <Tippy isModalAbove={isModalAbove} />
      <div className="gif-description-title-text-container">
        <h1>Image description</h1>
        <p>{description}</p>
      </div>

      <button className="btn-close-image-description" onClick={onToggleDescription}>
        Dismiss
      </button>
    </Modal>,
    document.getElementById("app")!
  );
};
