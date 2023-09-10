import { FC } from "react";

type PostPreviewBodyProps = {
  children: React.ReactNode;
};

export const PostPreviewBody: FC<PostPreviewBodyProps> = ({ children }) => {
  return <div className="post-preview-body">{children}</div>;
};
