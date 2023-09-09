import { useEffect } from "react";
import { useSelector } from "react-redux";
import postService from "../../../../services/post.service";
import { RootState } from "../../../../store/store";
import { useInView } from "react-intersection-observer";
import { PostPreviewHeader } from "../PostPreviewHeader/PostPreviewHeader";
import { VideoPlayer } from "../../../Video/VideoPlayer/VideoPlayer";
import { PostImg } from "../../PostImgList/PostImgList";
import { PostRepliedToUsersList } from "../../PostRepliedToUsersList/PostRepliedToUsersList";
import { GifDisplay } from "../../../Gif/GifDisplay/GifDisplay";
import { PollDisplay } from "../../../Poll/PollDisplay/PollDisplay";
import { MiniPostPreview } from "../MiniPostPreview/MiniPostPreview";
import { QuotedPostContent } from "../MiniPostPreview/QuotedPostContent/QuotedPostContent";
import { PostPreviewMainContainer } from "../MainContainer/PostPreviewMainContainer";
import { PostPreviewBody } from "../Body/PostPreviewBody";
import { PostPreviewText } from "../Text/PostPreviewText";
import { Footer } from "../../../App/Footer/Footer";
import { RepostDisplay } from "./RepostDisplay/RepostDisplay";
import { PostPreviewWrapper } from "../Wrapper/PostPreviewWrapper";
import { PostPreviewAside } from "./Aside/PostPreviewAside";
import { BtnShowThread } from "../../../Btns/BtnShowThread/BtnShowThread";
import { usePostPreview } from "../../../../contexts/PostPreviewContext";
import { VideoPlayerProvider } from "../../../../contexts/VideoPlayerContext";
import "./PostPreview.scss";
import { ExternalLink } from "../../../App/ExternalLink/ExternalLink";
import { FaGithub } from "react-icons/fa";
import { PostActions } from "../../Actions/PostActions";

export const PostPreview: React.FC = () => {
  const { post, isRepost } = usePostPreview();
  const { isViewed } = post.loggedInUserActionState;
  const postStartDate = post.schedule ? post.schedule : post.createdAt;
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
    if (shouldSaveImpression) postService.addImpression(post.id);
  }, [inView, post.id, loggedInUser, post.loggedInUserActionState.isViewed]);

  return (
    <article className="post-preview" ref={isViewed ? undefined : ref}>
      {isRepost && <RepostDisplay />}
      <PostPreviewWrapper className={"post-preview-wrapper" + (isRepost ? " with-repost" : "")}>
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
            {post.poll && <PollDisplay postStartDate={postStartDate} />}
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
      {isPostReplyFromPostOwner && <BtnShowThread />}
    </article>
  );
};
