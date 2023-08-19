import { useEffect } from "react";
import { useSelector } from "react-redux";
import postService from "../../../../services/post.service";
import { RootState } from "../../../../store/store";
import { useInView } from "react-intersection-observer";
import { PostPreviewHeader } from "../../PostPreviewHeader/PostPreviewHeader";
import { VideoPlayer } from "../../../Video/VideoPlayer/VideoPlayer";
import { PostImg } from "../../PostImgList/PostImgList";
import { PostRepliedToUsersList } from "../../PostRepliedToUsersList/PostRepliedToUsersList";
import { GifDisplay } from "../../../Gif/GifDisplay/GifDisplay";
import { PollDisplay } from "../../../Poll/PollDisplay/PollDisplay";
import { MiniPostPreview } from "../MiniPostPreview/MiniPostPreview";
import { QuotedPostContent } from "../MiniPostPreview/QuotedPostContent/QuotedPostContent";
import { PostPreviewActions } from "../PostPreviewActions/PostPreviewActions";
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
import { useLocation, useNavigate } from "react-router-dom";
import { getBasePathName } from "../../../../services/util/utils.service";

export const PostPreview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { post, poll } = usePostPreview();
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

  function onImgClick(idx: number) {
    const { pathname } = location;
    const basePath = getBasePathName(pathname, "imgs");
    navigate(`${basePath}/post/${post.id}/imgs/${idx + 1}`);
  }

  useEffect(() => {
    const shouldSaveImpression = inView && !post.loggedInUserActionState.isViewed && loggedInUser;
    if (shouldSaveImpression) postService.addImpression(post.id);
  }, [inView, post.id, loggedInUser, post.loggedInUserActionState.isViewed]);

  return (
    <article className="post-preview" ref={isViewed ? undefined : ref}>
      {post.repostedBy && <RepostDisplay />}
      <PostPreviewWrapper
        className={"post-preview-wrapper" + (post.repostedBy ? " with-repost" : "")}
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
            {post.imgs?.length > 0 && <PostImg imgs={post.imgs} onImgClick={onImgClick} />}
            {post.videoUrl && (
              <VideoPlayerProvider>
                <VideoPlayer videoUrl={post.videoUrl} isCustomControls={true} />
              </VideoPlayerProvider>
            )}
            {post.gif && <GifDisplay gif={post.gif} />}
            {poll && <PollDisplay postStartDate={postStartDate} />}
            {post.quotedPost && (
              <MiniPostPreview type={"quoted-post"}>
                <QuotedPostContent />
              </MiniPostPreview>
            )}
          </PostPreviewBody>
          <Footer>
            <PostPreviewActions />
          </Footer>
        </PostPreviewMainContainer>
      </PostPreviewWrapper>
      {isPostReplyFromPostOwner && <BtnShowThread />}
    </article>
  );
};
