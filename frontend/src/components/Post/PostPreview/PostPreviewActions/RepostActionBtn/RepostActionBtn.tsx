import { FC } from "react";
import { AiOutlineRetweet } from "react-icons/ai";
import { HiOutlinePencilAlt } from "react-icons/hi";
import "./RepostActionBtn.scss";
import { Modal } from "../../../../Modal/Modal";
import { useRemoveRepost } from "../../../../../hooks/reactQuery/post/useRemoveRepost";
import { useCreateRepost } from "../../../../../hooks/reactQuery/post/useCreateRepost";
import { PostPreviewActionBtn as TypeOfPostPreviewActionBtn } from "../PostPreviewActions";
import { AppDispatch } from "../../../../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../store/store";
import {
  NewPostType,
  setNewPostType,
  setNewPosts,
} from "../../../../../store/slices/postEditSlice";
import { useNavigate } from "react-router-dom";
import { Post } from "../../../../../../../shared/interfaces/post.interface";
import { PostPreviewActionBtn } from "../PostPreviewActionBtn/PostPreviewActionBtn";

type RepostActionBtnProps = {
  btn: TypeOfPostPreviewActionBtn;
  post: Post;
};

export const RepostActionBtn: FC<RepostActionBtnProps> = ({ post, btn }) => {
  const { addRepost } = useCreateRepost();
  const { removeRepost } = useRemoveRepost();
  const dispatch: AppDispatch = useDispatch();
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { isReposted } = post.loggedInUserActionState;

  async function onQuotePost() {
    dispatch(setNewPostType(NewPostType.Quote));
    dispatch(setNewPosts({ newPosts: [], newPostType: NewPostType.Quote, post }));
    navigate("compose", { relative: "path" });
  }

  async function onRepost() {
    const repostedPost = { ...post };
    addRepost(repostedPost);
  }

  async function onRemoveRepost() {
    if (!loggedInUser) return;
    removeRepost(post.id);
  }

  const btns = [
    {
      title: isReposted ? "undo rechirp" : "rechirp",
      icon: <AiOutlineRetweet size={20} />,
      onClickFunc: isReposted ? onRemoveRepost : onRepost,
    },
    {
      title: "quote rechirp",
      icon: <HiOutlinePencilAlt size={20} />,
      onClickFunc: () => onQuotePost(),
    },
  ];
  return (
    <Modal>
      <Modal.OpenBtn modalName="repost" setPositionByRef={true}>
        <div>
          <PostPreviewActionBtn btn={btn} />
        </div>
      </Modal.OpenBtn>
      <Modal.Window
        name="repost"
        className="repost-options"
        mainScreenMode="transparent"
        mainScreenZIndex={1000}
        style={{ transform: "translate(-50%,-50%)" }}
      >
        {btns.map(btn => (
          <Modal.CloseBtn key={btn.title} onClickFn={btn.onClickFunc}>
            <button className="btn-repost-option">
              {btn.icon} <span>{btn.title}</span>
            </button>
          </Modal.CloseBtn>
        ))}
      </Modal.Window>
    </Modal>
  );
};
