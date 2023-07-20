import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Post, QuotedPost } from "../../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../../store/types";
import { addFollowFromPost, removeFollowFromPost } from "../../../store/actions/post.actions";
import { useModalPosition } from "../../../hooks/useModalPosition";
import { userService } from "../../../services/user.service";
import { postService } from "../../../services/post.service";
import { RootState } from "../../../store/store";
import { useCustomElementHover } from "../../../hooks/useCustomElementHover";
import { AiOutlineRetweet } from "react-icons/ai";
import { useInView } from "react-intersection-observer";
import { UserImg } from "../../User/UserImg/UserImg";
import {
  UserPreviewModal,
  UserPreviewModalPosition,
} from "../../Modals/UserPreviewModal/UserPreviewModal";
import { PostPreviewHeader } from "../PostPreviewHeader/PostPreviewHeader";
import { VideoPlayer } from "../../Video/VideoPlayer/VideoPlayer";
import { PostImg } from "../PostImg/PostImg";
import { PostRepliedToUsersList } from "../PostRepliedToUsersList/PostRepliedToUsersList";
import { GifDisplay } from "../../Gif/GifDisplay/GifDisplay";
import { PollDisplay } from "../../Poll/PollDisplay/PollDisplay";
import { MiniPostPreview } from "../MiniPostPreview/MiniPostPreview/MiniPostPreview";
import { QuotedPostContent } from "../MiniPostPreview/QuotedPostContent/QuotedPostContent";
import { PostPreviewActions } from "../PostPreviewActions/PostPreviewActions";
import "./PostPreview.scss";

interface PostPreviewProps {
  post: Post;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const isLoggedinUserPost = loggedinUser?.id === post.createdBy.id;
  const postStartDate = post.schedule ? post.schedule : post.createdAt;
  const [poll, setPoll] = useState(post.poll || null);

  const { elementRef, isModalAbove, updateModalPosition } = useModalPosition<HTMLDivElement>({
    modalHeight: 300,
  });
  const { elementsHoverState, handleMouseEnter, handleMouseLeave } = useCustomElementHover({
    userImg: false,
  });

  const { isViewed, isDetailedViewed, isHashTagClicked, isProfileViewed, isLinkClicked } =
    post.loggedinUserActionState;
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) postService.addImpression(post.id);
  }, [inView]);

  const isPostReplyFromPostOwner = () => {
    if (!post || !loggedinUser) return false;
    return (
      post?.repliedPostDetails &&
      post.repliedPostDetails.at(-1)?.postOwner.userId === loggedinUser.id
    );
  };

  const onNavigateToPostDetails = async () => {
    if (!isDetailedViewed) await postService.updatePostStats(post.id, { isDetailedViewed: true });
    navigate(`/post/${post.id}`);
  };

  const onNavigateToProfile = async (username: string) => {
    if (!isProfileViewed) await postService.updatePostStats(post.id, { isProfileViewed: true });
    navigate(`/profile/${username}`);
  };

  const handleLinkClick = async (e: React.MouseEvent) => {
    if (e.target instanceof HTMLAnchorElement) {
      e.preventDefault();
      const type = e.target.dataset.type;
      if (type === "hashtag") {
        if (!isHashTagClicked)
          await postService.updatePostStats(post.id, { isHashTagClicked: true });
        const url = e.target.dataset.url;
        navigate(`/explore/${url}`);
      } else if (type === "profile-link") {
        const url = e.target.href;
        const username = url.slice(url.lastIndexOf("/") + 1);
        navigate(`/profile/${username}`);
      } else if (type === "external-link") {
        if (!isLinkClicked) await postService.updatePostStats(post.id, { isLinkClicked: true });
        window.open(e.target.href, "_blank");
      }
    }
  };

  const onHandleMouseEnter = () => {
    updateModalPosition();
    handleMouseEnter("userImg");
  };

  const handleToggleFollow = () => {
    if (post.createdBy.isFollowing) {
      dispatch(removeFollowFromPost(post.createdBy.id, post.id));
    } else {
      dispatch(addFollowFromPost(post.createdBy.id, post.id));
    }
  };

  const getModalPosition = (): UserPreviewModalPosition => {
    return isModalAbove
      ? {
          top: "unset",
          bottom: "55px",
        }
      : {
          bottom: "unset",
          top: "55px",
        };
  };

  return (
    <article className="post-preview" ref={isViewed ? undefined : ref}>
      {post.repostedBy && (
        <div className="post-preview-repost-container">
          <div className="repost-icon-container" onClick={onNavigateToPostDetails}>
            <AiOutlineRetweet size={18} />
          </div>
          <span
            className="post-preview-repost-user"
            onClick={() => onNavigateToProfile(post.repostedBy!.username)}
          >
            {`${
              post.repostedBy.id === loggedinUser?.id ? "You" : post.repostedBy.fullname
            } Rechiped`}
          </span>
        </div>
      )}
      <div className={"post-preview-content-wrapper" + (post.repostedBy ? " with-repost" : "")}>
        <div
          className={
            "post-preview-content-wrapper-user-img-container" +
            (isModalAbove ? " modal-above" : " modal-below")
          }
          onMouseEnter={() => onHandleMouseEnter()}
          onMouseLeave={() => handleMouseLeave("userImg")}
          ref={elementRef}
        >
          <UserImg
            imgUrl={post.createdBy.imgUrl || userService.getDefaultUserImgUrl()}
            onNavigateToProfile={() => onNavigateToProfile(post.createdBy.username)}
          />

          {elementsHoverState.userImg && (
            <UserPreviewModal
              user={post.createdBy}
              onToggleFollow={handleToggleFollow}
              onNavigateToProfile={() => onNavigateToProfile(post.createdBy.username)}
              handleMouseLeave={() => handleMouseLeave("userImg")}
              userPreviewModalPosition={getModalPosition()}
            />
          )}
        </div>
        <div className="post-preview-main-container">
          <PostPreviewHeader
            post={post}
            onNavigateToProfile={() => onNavigateToProfile(post.createdBy.username)}
            onNavigateToPostDetails={onNavigateToPostDetails}
            onToggleFollow={handleToggleFollow}
          />
          <main className="post-preview-body">
            {!isPostReplyFromPostOwner() &&
              post.repliedPostDetails &&
              post.repliedPostDetails.length > 0 && (
                <PostRepliedToUsersList repliedPostDetails={post.repliedPostDetails} />
              )}
            <p
              className="post-preview-text"
              dangerouslySetInnerHTML={{ __html: postService.formatPostText(post.text) }}
              onClick={handleLinkClick}
            ></p>
            {post.imgs && post.imgs.length > 0 && <PostImg imgs={post.imgs} />}
            {post.videoUrl && <VideoPlayer videoUrl={post.videoUrl} isCustomControls={true} />}
            {post.gif && <GifDisplay gif={post.gif} />}
            {poll && (
              <PollDisplay
                isLoggedinUserPost={isLoggedinUserPost}
                postId={post.id}
                postStartDate={postStartDate}
                poll={poll}
                setPoll={setPoll}
              />
            )}
            {post.quotedPost && (
              <MiniPostPreview quotedPost={post.quotedPost} type={"quoted-post"}>
                {({ quotedPost }: { quotedPost: QuotedPost }) => (
                  <QuotedPostContent quotedPost={quotedPost} />
                )}
              </MiniPostPreview>
            )}
          </main>
          <footer className="flex">
            <PostPreviewActions post={post} />
          </footer>
        </div>
      </div>
      {isPostReplyFromPostOwner() && (
        <button className="btn-show-thread" onClick={onNavigateToPostDetails}>
          <span>Show this thread</span>
        </button>
      )}
    </article>
  );
};
