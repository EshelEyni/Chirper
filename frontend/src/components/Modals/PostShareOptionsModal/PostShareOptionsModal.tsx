import { AiOutlineLink } from "react-icons/ai";
import { Post } from "../../../../../shared/interfaces/post.interface";
import { FiUpload } from "react-icons/fi";
import { MdOutlineBookmarkAdd, MdOutlineBookmarkRemove } from "react-icons/md";
import { copyToClipboard } from "../../../services/util/utils.service";
import postService from "../../../services/post.service";
import "./PostShareOptionsModal.scss";
import { Modal } from "../Modal/Modal";
import { useRemoveBookmark } from "../../../hooks/post/useRemoveBookmark";
import { useAddBookmark } from "../../../hooks/post/useAddBookmark";
import { toast } from "react-hot-toast";
import { UserMsg } from "../../Msg/UserMsg/UserMsg";
import { UserMsg as TypeOfUserMsg } from "../../../../../shared/interfaces/system.interface";

type PostShareOptionsModalProps = {
  post: Post;
  isModalAbove: boolean;
  onToggleModal: () => void;
};

export const PostShareOptionsModal: React.FC<PostShareOptionsModalProps> = ({
  post,
  isModalAbove,
  onToggleModal,
}) => {
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
        onToggleModal();
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
        onToggleModal();
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
        onToggleModal();
      },
    },
  ];

  return (
    <Modal
      className="post-share-options"
      onClickMainScreen={onToggleModal}
      style={isModalAbove ? { bottom: "30px" } : { top: "30px" }}
    >
      {btns.map(btn => (
        <button className="btn-share-option" key={btn.title} onClick={btn.onClickFunc}>
          {btn.icon} <span>{btn.title}</span>
        </button>
      ))}
    </Modal>
  );
};
