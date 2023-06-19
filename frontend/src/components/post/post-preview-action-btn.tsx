import { Post } from "../../../../shared/interfaces/post.interface";
import { useCustomElementHover } from "../../hooks/useCustomElementHover";
import { utilService } from "../../services/util.service/utils.service";
import { PostShareOptionsModal } from "../modals/post-share-options-modal";
import { RepostOptionsModal } from "../modals/repost-options-modal";
import { ElementTitle } from "../other/element-title";
import { PostPreviewActionBtn as PostPreviewActionBtnType } from "./post-preview-actions";

type PostPreviewActionBtnProps = {
  btn: PostPreviewActionBtnType;
  btnRef?: React.RefObject<HTMLButtonElement>;
  isRepostModalOpen: boolean;
  setIsRepostModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isShareModalOpen: boolean;
  setIsShareModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isReposted: boolean;
  post: Post;
  onRepost: () => void;
  onRemoveRepost: () => void;
  onQuotePost: () => void;
  isModalAbove: boolean;
};

export const PostPreviewActionBtn: React.FC<PostPreviewActionBtnProps> = ({
  btn,
  btnRef,
  isRepostModalOpen,
  setIsRepostModalOpen,
  isShareModalOpen,
  setIsShareModalOpen,
  isReposted,
  post,
  onRepost,
  onRemoveRepost,
  onQuotePost,
  isModalAbove,
}) => {
  const { name, title, isClicked, icon, count, onClickFunc } = btn;
  const { elementsHoverState, handleMouseEnter, handleMouseLeave } = useCustomElementHover({
    btnActionContainer: false,
  });
  return (
    <div
      className={`btn-action-container ${name}`}
      onMouseEnter={() => handleMouseEnter("btnActionContainer")}
      onMouseLeave={() => handleMouseLeave("btnActionContainer")}
    >
      <button
        className={"btn-action " + (isClicked ? " clicked" : "")}
        onClick={onClickFunc}
        ref={name === "share" ? btnRef : undefined}
      >
        <div className="icon-container">{icon}</div>
        {count !== undefined && (
          <span className="count">{count > 0 ? utilService.formatNumToK(count) : ""}</span>
        )}
      </button>
      {elementsHoverState?.btnActionContainer && (
        <ElementTitle
          title={title}
          customTop="35px"
          customLeft={count !== undefined && count !== 0 ? "0" : undefined}
          customTransform={count !== undefined && count !== 0 ? "none" : undefined}
        />
      )}

      {name === "rechirp" && isRepostModalOpen && (
        <RepostOptionsModal
          onToggleModal={() => setIsRepostModalOpen(prev => !prev)}
          onRepost={onRepost}
          onRemoveRepost={onRemoveRepost}
          onQuotePost={onQuotePost}
          isReposted={isReposted}
        />
      )}

      {name === "share" && isShareModalOpen && (
        <PostShareOptionsModal
          post={post}
          onToggleModal={() => setIsShareModalOpen(prev => !prev)}
          isModalAbove={isModalAbove}
        />
      )}
    </div>
  );
};
