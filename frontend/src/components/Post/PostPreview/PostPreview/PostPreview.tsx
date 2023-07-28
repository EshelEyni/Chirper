import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Post, QuotedPost } from "../../../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../../../store/types";
import { addFollowFromPost, removeFollowFromPost } from "../../../../store/actions/post.actions";
import { useModalPosition } from "../../../../hooks/useModalPosition";
import { userService } from "../../../../services/user.service";
import { postService } from "../../../../services/post.service";
import { RootState } from "../../../../store/store";
import { useCustomElementHover } from "../../../../hooks/useCustomElementHover";
import { AiOutlineRetweet } from "react-icons/ai";
import { useInView } from "react-intersection-observer";
import { UserImg } from "../../../User/UserImg/UserImg";
import {
  UserPreviewModal,
  UserPreviewModalPosition,
} from "../../../Modals/UserPreviewModal/UserPreviewModal";
import { PostPreviewHeader } from "../../PostPreviewHeader/PostPreviewHeader";
import { VideoPlayer } from "../../../Video/VideoPlayer/VideoPlayer";
import { PostImg } from "../../PostImg/PostImg";
import { PostRepliedToUsersList } from "../../PostRepliedToUsersList/PostRepliedToUsersList";
import { GifDisplay } from "../../../Gif/GifDisplay/GifDisplay";
import { PollDisplay } from "../../../Poll/PollDisplay/PollDisplay";
import { MiniPostPreview } from "../MiniPostPreview/MiniPostPreview/MiniPostPreview";
import { QuotedPostContent } from "../MiniPostPreview/QuotedPostContent/QuotedPostContent";
import { PostPreviewActions } from "../../PostPreviewActions/PostPreviewActions";
import "./PostPreview.scss";
import { PostPreviewMainContainer } from "../MainContainer/PostPreviewMainContainer";
import { PostPreviewBody } from "../Body/PostPreviewBody";
import { PostPreviewText } from "../Text/PostPreviewText";

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
        <PostPreviewMainContainer>
          <PostPreviewHeader
            post={post}
            onNavigateToProfile={() => onNavigateToProfile(post.createdBy.username)}
            onNavigateToPostDetails={onNavigateToPostDetails}
            onToggleFollow={handleToggleFollow}
          />
          <PostPreviewBody>
            {!isPostReplyFromPostOwner() &&
              post.repliedPostDetails &&
              post.repliedPostDetails.length > 0 && (
                <PostRepliedToUsersList repliedPostDetails={post.repliedPostDetails} />
              )}
            <PostPreviewText
              text={post.text}
              isPlainText={false}
              postId={post.id}
              loggedinUserActionState={post.loggedinUserActionState}
            />
            {post.imgs && post.imgs.length > 0 && <PostImg imgs={post.imgs} />}
            {post.videoUrl && <VideoPlayer videoUrl={post.videoUrl} isCustomControls={true} />}
            {post.gif && <GifDisplay gif={post.gif} />}
            {poll && (
              <PollDisplay
                postId={post.id}
                postStartDate={postStartDate}
                poll={poll}
                setPoll={setPoll}
              />
            )}
            {post.quotedPost && (
              <MiniPostPreview quotedPost={post.quotedPost} type={"quoted-post"}>
                <QuotedPostContent quotedPost={post.quotedPost} />
              </MiniPostPreview>
            )}
          </PostPreviewBody>
          <footer className="flex">
            <PostPreviewActions post={post} />
          </footer>
        </PostPreviewMainContainer>
      </div>
      {isPostReplyFromPostOwner() && (
        <button className="btn-show-thread" onClick={onNavigateToPostDetails}>
          <span>Show this thread</span>
        </button>
      )}
    </article>
  );
};
