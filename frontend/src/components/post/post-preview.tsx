import { Post } from "../../../../shared/interfaces/post.interface";
import { utilService } from "../../services/util.service/utils.service";
import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import { PostPreviewActions } from "./post-preview-actions";
import { UserImg } from "../user/user-img";
import { PostImg } from "./post-img";
import { GifDisplay } from "../gif/gif-display";
import { userService } from "../../services/user.service";
import { PollDisplay } from "../poll/poll-display";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { ReactComponent as BlueCheckMark } from "../../assets/svg/blue-check-mark.svg";
import { Logo } from "../other/logo";
import { VideoPlayer } from "../video/video-player";
import { PostRepliedToUsersList } from "./post-replied-to-users-list";
import { AiOutlineRetweet } from "react-icons/ai";
import { MiniPostPreview } from "./mini-post-preview";
import { useInView } from "react-intersection-observer";
import { postService } from "../../services/post.service";
import { useNavigate } from "react-router-dom";
import { PostPreviewHeader } from "./post-preview-header";

interface PostPreviewProps {
  post: Post;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  const navigate = useNavigate();
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const isLoggedinUserPost = loggedinUser?.id === post.createdBy.id;
  const postStartDate = post.schedule ? post.schedule : post.createdAt;
  const [poll, setPoll] = useState(post.poll || null);
  const {
    isViewed,
    isDetailedViewed,
    isFollowedFromPost,
    isHashTagClicked,
    isProfileViewed,
    isLinkClicked,
  } = post.loggedinUserActionState;
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

  const formmatText = (text: string): string => {
    const urls = text.match(/(https?:\/\/[^\s]+)/g);
    const urlsSet = new Set(urls);
    let formmatedText = text;
    if (urlsSet) {
      urlsSet.forEach(url => {
        const trimmedUrl = url.replace("https://www.", "");
        formmatedText = formmatedText.replaceAll(
          url,
          `<a href="${url}" data-type="external-link">${trimmedUrl}</a>`
        );
      });
    }

    const hashtags = text.match(/(^|\s)(#[^\s]+)/g);
    const hashtagsSet = new Set(hashtags);
    if (hashtagsSet) {
      hashtagsSet.forEach(hashtag => {
        formmatedText = formmatedText.replaceAll(
          hashtag,
          `<a data-url="${hashtag.slice(1)}" data-type="hashtag">${hashtag}</a>`
        );
      });
    }

    const mentions = text.match(/@[^\s]+/g);
    if (mentions) {
      mentions.forEach(mention => {
        formmatedText = formmatedText.replaceAll(
          mention,
          `<a href="/${mention.slice(1)}" data-type="profile-link">${mention}</a>`
        );
      });
    }

    const lineBreaks = formmatedText.match(/\n/g);
    if (lineBreaks) {
      formmatedText = formmatedText.replaceAll("\n", "<br />");
    }

    return formmatedText;
  };

  const onNavigateToPostDetails = async () => {
    if (!isDetailedViewed) await postService.updatePostStats(post.id, { isDetailedViewed: true });
    console.log("onNavigateToPostDetails");
  };

  const onNavigateToProfile = async (userId: string) => {
    if (!isProfileViewed) await postService.updatePostStats(post.id, { isProfileViewed: true });
    console.log("onNavigateToProfile: ", userId);
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

  const onToggleFollow = async () => {
    if (!isFollowedFromPost)
      await postService.updatePostStats(post.id, { isFollowedFromPost: true });
    console.log("onToggleFollow");
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
            onClick={() => onNavigateToProfile(post.repostedBy!.id)}
          >
            {`${
              post.repostedBy.id === loggedinUser?.id ? "You" : post.repostedBy.fullname
            } Rechiped`}
          </span>
        </div>
      )}
      <div className={"post-preview-content-wrapper" + (post.repostedBy ? " with-repost" : "")}>
        <UserImg imgUrl={post.createdBy.imgUrl || userService.getDefaultUserImgUrl()} />
        <div className="post-preview-main-container">
          <PostPreviewHeader post={post} />
          <main className="post-preview-body">
            {!isPostReplyFromPostOwner() &&
              post.repliedPostDetails &&
              post.repliedPostDetails.length > 0 && (
                <PostRepliedToUsersList repliedPostDetails={post.repliedPostDetails} />
              )}
            <p
              className="post-preview-text"
              dangerouslySetInnerHTML={{ __html: formmatText(post.text) }}
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
            {post.quotedPost && <MiniPostPreview quotedPost={post.quotedPost} type={"quote"} />}
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
