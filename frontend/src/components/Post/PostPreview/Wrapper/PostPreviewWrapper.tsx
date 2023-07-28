import { FC } from "react";
import "./PostPreviewWrapper.scss";

type PostPreviewWrapperProps = {
  className: string;
  children: React.ReactNode;
};

export const PostPreviewWrapper: FC<PostPreviewWrapperProps> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};
