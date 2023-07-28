import { FC } from "react";

type PostPreviewMainContainerProps = {
  children: React.ReactNode;
};

export const PostPreviewMainContainer: FC<PostPreviewMainContainerProps> = ({ children }) => {
  return <div className="post-preview-main-container">{children}</div>;
};
