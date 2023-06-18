import { AiOutlineLink } from "react-icons/ai";
import { Post } from "../../../../shared/interfaces/post.interface";
import { FiUpload } from "react-icons/fi";
import { FaRegEnvelope } from "react-icons/fa";
import { MdOutlineBookmarkAdd, MdOutlineBookmarkRemove } from "react-icons/md";
import { utilService } from "../../services/util.service/utils.service";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/types";
import { addBookmark, removeBookmark } from "../../store/actions/post.actions";
import { postService } from "../../services/post.service";
import { setUserMsg } from "../../store/actions/system.actions";

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
  const { isBookmarked } = post.loggedinUserActionState;
  const dispatch: AppDispatch = useDispatch();

  const url = `${location.origin}/post/${post.id}`;
  const btns = [
    {
      text: "Copy link to Chirp",
      icon: <AiOutlineLink size={20} />,
      onClickFunc: () => {
        postService.updatePostStats(post.id, { isPostLinkCopied: true });
        utilService.copyToClipboard(url);
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
      text: "Share Chirp via...",
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
      text: "Send via Direct Message",
      icon: <FaRegEnvelope size={20} />,
      // TODO: add send via direct message functionality and update post stats
      onClickFunc: () => {
        console.log("send via direct message");
        // onToggleModal();
      },
    },
    {
      text: isBookmarked ? "Remove Chirp from Bookmarks" : "Bookmark",
      icon: isBookmarked ? (
        <MdOutlineBookmarkRemove size={20} />
      ) : (
        <MdOutlineBookmarkAdd size={20} />
      ),
      onClickFunc: async () => {
        if (isBookmarked) {
          postService.updatePostStats(post.id, { isPostBookmarked: false });
          dispatch(removeBookmark(post.id));
        } else {
          postService.updatePostStats(post.id, { isPostBookmarked: true });
          dispatch(addBookmark(post.id));
        }
        onToggleModal();
      },
    },
  ];

  console.log("isModalAbove", isModalAbove);

  return (
    <>
      <div className="main-screen" onClick={onToggleModal} />
      <section
        className="post-share-options-modal"
        style={isModalAbove ? { bottom: "30px" } : { top: "30px" }}
      >
        {btns.map((btn, i) => (
          <button className="btn-share-option" key={i} onClick={btn.onClickFunc}>
            {btn.icon} <span>{btn.text}</span>
          </button>
        ))}
      </section>
    </>
  );
};
