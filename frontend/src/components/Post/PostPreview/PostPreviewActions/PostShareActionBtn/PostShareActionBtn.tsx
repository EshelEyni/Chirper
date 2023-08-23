import { AiOutlineLink } from "react-icons/ai";
import { Post } from "../../../../../../../shared/interfaces/post.interface";
import { FiUpload } from "react-icons/fi";
import { MdOutlineBookmarkAdd, MdOutlineBookmarkRemove } from "react-icons/md";
import { copyToClipboard } from "../../../../../services/util/utils.service";
import postService from "../../../../../services/post.service";
import "./PostShareActionBtn.scss";
import { Modal } from "../../../../Modal/Modal";
import { useRemoveBookmark } from "../../../../../hooks/reactQuery/post/useRemoveBookmark";
import { useAddBookmark } from "../../../../../hooks/reactQuery/post/useAddBookmark";
import { toast } from "react-hot-toast";
import { UserMsg } from "../../../../Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../../../../../shared/interfaces/system.interface";
import { PostPreviewActionBtn as PostPreviewActionBtnType } from "../PostPreviewActions";
import { PostPreviewActionBtn } from "../PostPreviewActionBtn/PostPreviewActionBtn";

type PostShareActionBtnProps = {
  btn: PostPreviewActionBtnType;
  post: Post;
};

export const PostShareActionBtn: React.FC<PostShareActionBtnProps> = ({ post, btn }) => {
  const { isBookmarked } = post.loggedInUserActionState;

  const { removeBookmark } = useRemoveBookmark();
  const { addBookmark } = useAddBookmark();

  const url = `${location.origin}/post/${post.id}`;
  const btns = [
    {
      title: "Copy link to Chirp",
      icon: <AiOutlineLink size={20} />,
      onClickFunc: () => {
        postService.updatePostStats(post.id, { isPostLinkCopied: true });
        copyToClipboard(url);
        const msg = {
          type: "info",
          text: "Copied to clipboard",
        } as TypeOfUserMsg;
        toast.success(t => <UserMsg userMsg={msg} onDismiss={() => toast.dismiss(t.id)} />);
      },
    },
    {
      title: "Share Chirp via...",
      icon: <FiUpload size={20} />,
      onClickFunc: () => {
        postService.updatePostStats(post.id, { isPostShared: true });
        navigator
          .share({ title: "Chirp", text: post.text, url })
          .then(() => console.log("Successful share"))
          .catch(error => console.log("Error sharing", error));
      },
    },
    {
      title: isBookmarked ? "Remove Chirp from Bookmarks" : "Bookmark",
      icon: isBookmarked ? (
        <MdOutlineBookmarkRemove size={20} />
      ) : (
        <MdOutlineBookmarkAdd size={20} />
      ),
      onClickFunc: async () => {
        if (isBookmarked) removeBookmark(post.id);
        else addBookmark(post.id);
      },
    },
  ];

  return (
    <Modal>
      <Modal.OpenBtn modalName="share" setPositionByRef={true}>
        <div>
          <PostPreviewActionBtn btn={btn} />
        </div>
      </Modal.OpenBtn>
      <Modal.Window
        name="share"
        className="post-share-options"
        mainScreenMode="transparent"
        mainScreenZIndex={1000}
        style={{ transform: "translate(-90%,-30%)" }}
      >
        {btns.map(btn => (
          <Modal.CloseBtn key={btn.title} onClickFn={btn.onClickFunc}>
            <button className="btn-share-option">
              {btn.icon} <span>{btn.title}</span>
            </button>
          </Modal.CloseBtn>
        ))}
      </Modal.Window>
    </Modal>
  );
};
