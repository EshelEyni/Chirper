import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Post } from "../../../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../../../store/types";
import { addFollowFromPost, removeFollowFromPost } from "../../../../store/actions/post.actions";
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
import { PostPreviewActions } from "../../PostPreviewActions/PostPreviewActions";
import "./PostPreview.scss";
import { PostPreviewMainContainer } from "../MainContainer/PostPreviewMainContainer";
import { PostPreviewBody } from "../Body/PostPreviewBody";
import { PostPreviewText } from "../Text/PostPreviewText";
import { Footer } from "../../../App/Footer/Footer";
import { RepostDisplay } from "./RepostDisplay/RepostDisplay";
import { PostPreviewWrapper } from "../Wrapper/PostPreviewWrapper";
import { PostPreviewAside } from "./Aside/PostPreviewAside";
import { BtnShowThread } from "../../../Btns/BtnShowThread/BtnShowThread";

interface PostPreviewProps {
  post: Post;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  const { isViewed, isDetailedViewed, isProfileViewed } = post.loggedinUserActionState;
  const postStartDate = post.schedule ? post.schedule : post.createdAt;

  const [poll, setPoll] = useState(post.poll || null);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const isPostReplyFromPostOwner =
    post?.repliedPostDetails &&
    post.repliedPostDetails.at(-1)?.postOwner.userId === loggedinUser?.id;

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  async function onNavigateToPostDetails() {
    if (!isDetailedViewed) await postService.updatePostStats(post.id, { isDetailedViewed: true });
    navigate(`/post/${post.id}`);
  }

  async function onNavigateToProfile(username: string) {
    if (!isProfileViewed) await postService.updatePostStats(post.id, { isProfileViewed: true });
    navigate(`/profile/${username}`);
  }

  function onToggleFollow() {
    if (post.createdBy.isFollowing) dispatch(removeFollowFromPost(post.createdBy.id, post.id));
    else dispatch(addFollowFromPost(post.createdBy.id, post.id));
  }

  useEffect(() => {
    if (inView) postService.addImpression(post.id);
  }, [inView, post.id]);

  return (
    <article className="post-preview" ref={isViewed ? undefined : ref}>
      {post.repostedBy && (
        <RepostDisplay
          repostedBy={post.repostedBy}
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToPostDetails={onNavigateToPostDetails}
          onToggleFollow={onToggleFollow}
        />
      )}
      <PostPreviewWrapper
        className={"post-preview-wrapper" + (post.repostedBy ? " with-repost" : "")}
      >
        <PostPreviewAside
          post={post}
          onNavigateToProfile={onNavigateToProfile}
          onToggleFollow={onToggleFollow}
        />
        <PostPreviewMainContainer>
          <PostPreviewHeader
            post={post}
            onNavigateToProfile={() => onNavigateToProfile(post.createdBy.username)}
            onNavigateToPostDetails={onNavigateToPostDetails}
            onToggleFollow={onToggleFollow}
          />
          <PostPreviewBody>
            {!isPostReplyFromPostOwner &&
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
          <Footer>
            <PostPreviewActions post={post} />
          </Footer>
        </PostPreviewMainContainer>
      </PostPreviewWrapper>
      {isPostReplyFromPostOwner && <BtnShowThread onHandleClick={onNavigateToPostDetails} />}
    </article>
  );
};
