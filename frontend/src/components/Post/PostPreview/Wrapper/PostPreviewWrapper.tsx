import { FC } from "react";

type PostPreviewWrapperProps = {
  className: string;
  children: React.ReactNode;
};

export const PostPreviewWrapper: FC<PostPreviewWrapperProps> = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};
