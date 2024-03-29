import { FaGithub } from "react-icons/fa";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import postApiService from "../../../services/post/postApiService";
import { useInView } from "react-intersection-observer";
import { PostPreviewHeader } from "./PostPreviewHeader";
import { VideoPlayer } from "../../Video/VideoPlayer/VideoPlayer";
import { PostImg } from "../PostImgList/PostImgList";
import { PostRepliedToUsersList } from "../PostRepliedToUsersList/PostRepliedToUsersList";
import { GifDisplay } from "../../Gif/GifDisplay/GifDisplay";
import { PollDisplay } from "../../Poll/PollDisplay/PollDisplay";
import { MiniPostPreview } from "./MiniPostPreview";
import { QuotedPostContent } from "./QuotedPostContent";
import { PostPreviewMainContainer } from "./PostPreviewMainContainer";
import { PostPreviewBody } from "./PostPreviewBody";
import { PostPreviewText } from "./PostPreviewText";
import { Footer } from "../../App/Footer/Footer";
import { RepostDisplay } from "./RepostDisplay";
import { PostPreviewWrapper } from "./PostPreviewWrapper";
import { PostPreviewAside } from "./PostPreviewAside";
import { usePostPreview } from "../../../contexts/PostPreviewContext";
import { VideoPlayerProvider } from "../../../contexts/VideoPlayerContext";
import { ExternalLink } from "../../App/ExternalLink/ExternalLink";
import { PostActions } from "../Actions/PostActions";
import "./PostPreview.scss";
import postUtilService from "../../../services/post/postUtilService";
import { RootState } from "../../../types/app";
import { Button } from "../../App/Button/Button";

export const PostPreview: React.FC = () => {
  const { post, onNavigateToPostDetails } = usePostPreview();
  const { isViewed } = post.loggedInUserActionState;
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const isPostReplyFromPostOwner =
    post?.repliedPostDetails &&
    post.repliedPostDetails.at(-1)?.postOwner.userId === loggedInUser?.id;
  const isRepliedToUserListShown =
    !isPostReplyFromPostOwner && post.repliedPostDetails && post.repliedPostDetails.length > 0;

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  useEffect(() => {
    const shouldSaveImpression = inView && !post.loggedInUserActionState.isViewed && loggedInUser;
    if (shouldSaveImpression) postApiService.addImpression(post.id);
  }, [inView, post.id, loggedInUser, post.loggedInUserActionState.isViewed]);

  return (
    <article className="post-preview" ref={isViewed ? undefined : ref}>
      {postUtilService.isRepost(post) && <RepostDisplay />}
      <PostPreviewWrapper
        className={"post-preview-wrapper" + (postUtilService.isRepost(post) ? " with-repost" : "")}
      >
        <PostPreviewAside />
        <PostPreviewMainContainer>
          <PostPreviewHeader />
          <PostPreviewBody>
            {isRepliedToUserListShown && <PostRepliedToUsersList />}
            {post.text && (
              <PostPreviewText
                text={post.text}
                isPlainText={false}
                postId={post.id}
                loggedInUserActionState={post.loggedInUserActionState}
              />
            )}
            {post.imgs?.length > 0 && <PostImg post={post} />}
            {"linkToRepo" in post && (
              <ExternalLink link={post.linkToRepo as string}>
                <FaGithub size={18} color="var(--color-text-gray)" /> <span>Promoted</span>
              </ExternalLink>
            )}
            {post.videoUrl && (
              <VideoPlayerProvider>
                <VideoPlayer videoUrl={post.videoUrl} isCustomControls={true} />
              </VideoPlayerProvider>
            )}
            {post.gif && <GifDisplay gif={post.gif} />}
            {post.poll && <PollDisplay />}
            {post.quotedPost && (
              <MiniPostPreview type={"quoted-post"}>
                <QuotedPostContent />
              </MiniPostPreview>
            )}
          </PostPreviewBody>
          <Footer>
            <PostActions post={post}>
              <PostActions.Reply />
              <PostActions.Repost />
              <PostActions.Like />
              <PostActions.View />
              <PostActions.Share />
            </PostActions>
          </Footer>
        </PostPreviewMainContainer>
      </PostPreviewWrapper>
      {isPostReplyFromPostOwner && (
        <Button className="btn-show-thread" onClickFn={onNavigateToPostDetails}>
          <span>Show this thread</span>
        </Button>
      )}
    </article>
  );
};
