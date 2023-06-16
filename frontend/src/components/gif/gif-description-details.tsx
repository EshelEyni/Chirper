import { FC, Fragment } from "react";

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
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Fragment>
      <div className="main-screen" onClick={onToggleDescription} />
      <section
        className="gif-description-modal"
        style={isModalAbove ? { bottom: "30px" } : { top: "30px" }}
        onClick={handleClick}
      >
        <div className={"tippy" + (isModalAbove ? " down" : " up")}></div>
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
