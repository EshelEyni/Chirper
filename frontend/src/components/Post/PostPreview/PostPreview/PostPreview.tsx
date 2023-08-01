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
import "./PostPreview.scss";
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

export const PostPreview: React.FC = () => {
  const { post, poll } = usePostPreview();
  const { isViewed } = post.loggedinUserActionState;
  const postStartDate = post.schedule ? post.schedule : post.createdAt;
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const isPostReplyFromPostOwner =
    post?.repliedPostDetails &&
    post.repliedPostDetails.at(-1)?.postOwner.userId === loggedinUser?.id;
  const isRepliedToUserListShown =
    !isPostReplyFromPostOwner && post.repliedPostDetails && post.repliedPostDetails.length > 0;

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) postService.addImpression(post.id);
  }, [inView, post.id]);

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
            <PostPreviewText
              text={post.text}
              isPlainText={false}
              postId={post.id}
              loggedinUserActionState={post.loggedinUserActionState}
            />
            {post.imgs?.length > 0 && <PostImg imgs={post.imgs} />}
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
