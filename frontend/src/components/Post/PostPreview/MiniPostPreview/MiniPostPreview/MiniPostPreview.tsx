import { useDispatch, useSelector } from "react-redux";
import { NewPost, Post, QuotedPost } from "../../../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../../../store/store";
import { AppDispatch } from "../../../../../store/types";
import { setNewPost } from "../../../../../store/actions/new-post.actions";

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
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);
  const dispatch: AppDispatch = useDispatch();

  function onSetCurrPost(currPost: NewPost | undefined) {
    if (!currPost) return;
    dispatch(setNewPost(currPost, newPostType));
  }

  return (
    <article
      className={`mini-post-preview ${type}`}
      onClick={type === "new-post" ? () => onSetCurrPost(newPost) : undefined}
    >
      <div className="post-preview-wrapper"> {children}</div>
    </article>
  );
};
