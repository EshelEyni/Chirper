import { useDispatch } from "react-redux";
import { AiOutlineLink } from "react-icons/ai";
import { Post } from "../../../../../shared/interfaces/post.interface";
import { FiUpload } from "react-icons/fi";
import { MdOutlineBookmarkAdd, MdOutlineBookmarkRemove } from "react-icons/md";
import { copyToClipboard } from "../../../services/util/utils.service";
import { AppDispatch } from "../../../store/types";
import postService from "../../../services/post.service";
import "./PostShareOptionsModal.scss";
import { Modal } from "../Modal/Modal";
import { setUserMsg } from "../../../store/slices/systemSlice";
import { useRemoveBookmark } from "../../../hooks/post/useRemoveBookmark";
import { useAddBookmark } from "../../../hooks/post/useAddBookmark";

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
  const dispatch: AppDispatch = useDispatch();

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
        dispatch(
          setUserMsg({
            type: "info",
            text: "Copied to clipboard",
          })
        );
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
