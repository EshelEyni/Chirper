import { useDispatch, useSelector } from "react-redux";
import { setNewPost } from "../../../store/slices/postEditSlice";
import { NewPost, Post, QuotedPost } from "../../../../../shared/types/post";
import { PostPreviewWrapper } from "./PostPreviewWrapper";
import { AppDispatch, RootState } from "../../../types/app";
import "./MiniPostPreview.scss";

export interface MiniPostPreviewProps {
  post?: Post;
  newPost?: NewPost;
  quotedPost?: QuotedPost;
  type: MiniPostPreviewType;
  children: React.ReactNode;
}

export type MiniPostPreviewType =
  | "new-post"
  | "replied-post"
  | "quoted-post"
  | "post-stats-preview";

export const MiniPostPreview: React.FC<MiniPostPreviewProps> = ({ newPost, type, children }) => {
  const { newPostType } = useSelector((state: RootState) => state.postEdit);
  const dispatch: AppDispatch = useDispatch();

  function onSetCurrPost(newPost: NewPost | undefined) {
    if (!newPost) return;
    dispatch(setNewPost({ newPost, newPostType }));
  }

  return (
    <article
      className={`mini-post-preview ${type}`}
      onClick={type === "new-post" ? () => onSetCurrPost(newPost) : undefined}
    >
      <PostPreviewWrapper className="post-preview-wrapper">{children}</PostPreviewWrapper>
    </article>
  );
};
