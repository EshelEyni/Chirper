import { FC, Fragment } from "react";

type GifDescriptionModalProps = {
  description: string;
  onToggleDescription: (e: React.MouseEvent) => void;
  modalPosition: { top: number; left: number };
};

export const GifDescriptionModal: FC<GifDescriptionModalProps> = ({
  description,
  onToggleDescription,
  modalPosition,
}) => {
  return (
    <Fragment>
      <div className="main-screen" onClick={onToggleDescription}></div>
      <section
        className="gif-description-modal"
        style={{ top: modalPosition.top, left: modalPosition.left }}
      >
        <div className="gif-description-title-text-container">
          <h1>Image description</h1>
          <p>{description}</p>
        </div>

        <button className="btn-close-image-description" onClick={onToggleDescription}>
          Dismiss
        </button>
      </section>
    </Fragment>
  );
};
