import "./ElementTitle.scss";

type ElementTitleProps = {
  title: string;
  customTop?: string;
  customLeft?: string;
  customTransform?: string;
};

export const ElementTitle: React.FC<ElementTitleProps> = ({
  title,
  customTop,
  customLeft,
  customTransform,
}) => {
  return (
    <div
      className="element-title-container"
      style={{
        top: customTop ? customTop : "",
        left: customLeft ? customLeft : "",
        transform: customTransform ? customTransform : "",
      }}
    >
      <span className="element-title">{title}</span>
    </div>
  );
};
