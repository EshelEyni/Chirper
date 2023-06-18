type ElementTitleProps = {
  title: string;
};

export const ElementTitle: React.FC<ElementTitleProps> = ({ title }) => {
  return <div>{title}</div>;
};
