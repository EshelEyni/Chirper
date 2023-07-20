import { useDispatch, useSelector } from "react-redux";
import { NewPost, Post, QuotedPost } from "../../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../../store/store";
import { AppDispatch } from "../../../../store/types";
import { setNewPost } from "../../../../store/actions/new-post.actions";

export interface MiniPostPreviewProps {
  newPost?: NewPost;
  post?: Post;
  quotedPost?: QuotedPost;
  type: MiniPostPreviewType;
  // TODO: add children type
  children: (props: any) => JSX.Element;
}

export type MiniPostPreviewType =
  | "new-post"
  | "replied-post"
  | "quoted-post"
  | "post-stats-preview";

export const MiniPostPreview: React.FC<MiniPostPreviewProps> = props => {
  const { newPost, type, children } = props;
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);
  const dispatch: AppDispatch = useDispatch();

  const onSetCurrPost = (currPost: NewPost | undefined) => {
    if (!currPost) return;
    dispatch(setNewPost(currPost, newPostType));
  };

  return (
    <article
      className={`mini-post-preview ${type}`}
      onClick={type === "new-post" ? () => onSetCurrPost(newPost) : undefined}
    >
      <div className="post-preview-content-wrapper"> {children(props)}</div>
    </article>
  );
};
