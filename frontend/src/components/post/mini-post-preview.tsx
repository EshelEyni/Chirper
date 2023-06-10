import { NewPost, Post, QuotedPost } from "../../../../shared/interfaces/post.interface";
import { UserImg } from "../user/user-img";
import { PostImg } from "./post-img";
import { GifDisplay } from "../gif/gif-display";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { VideoPlayer } from "../video/video-player";
import { PollEdit } from "../poll/poll-edit";
import { AppDispatch } from "../../store/types";
import { setNewPost } from "../../store/actions/new-post.actions";
import { PostRepliedToUsersList } from "./post-replied-to-users-list";
import { ReactComponent as BlueCheckMark } from "../../assets/svg/blue-check-mark.svg";
import { Logo } from "../other/logo";
import { utilService } from "../../services/util.service/utils.service";
import { PostNotAvailableMsg } from "./post-not-available-msg";

interface MiniPostPreviewProps {
  newPost?: NewPost;
  post?: Post;
  quotedPost?: QuotedPost;
  type: MiniPostPreviewType;
}

export type MiniPostPreviewType = "new-post" | "reply" | "quote";

export const MiniPostPreview: React.FC<MiniPostPreviewProps> = ({
  newPost,
  post,
  quotedPost,
  type,
}) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { homePage, sideBar, newPostType } = useSelector((state: RootState) => state.newPostModule);
  const dispatch: AppDispatch = useDispatch();

  const onSetCurrPost = (currPost: NewPost | undefined) => {
    if (!currPost) return;
    dispatch(setNewPost(currPost, newPostType));
  };

  const setText = () => {
    switch (type) {
      case "new-post":
        if (newPost?.text) return newPost.text;
        if (newPost?.idx === 0) return "What's happening?";
        return "Add another Chirp!";
      case "reply":
        return post?.text;
      case "quote":
        return quotedPost?.text;
    }
  };

  const setIsPostLineRender = () => {
    if (newPost) {
      if (newPostType === "home-page") {
        return newPost.idx !== homePage.posts.length - 1;
      } else if (newPostType === "side-bar") {
        return newPost.idx !== sideBar.posts.length - 1;
      }
    } else if (post) {
      return true;
    }
  };

  const onNavigateToPost = () => {
    if (quotedPost) {
      console.log("onNavigateToPost: quotedPost", quotedPost);
    }
  };

  switch (type) {
    case "new-post":
      if (newPost)
        return (
          <article className={`mini-post-preview ${type}`} onClick={() => onSetCurrPost(newPost)}>
            <div className="post-preview-content-wrapper">
              <div className="mini-post-preview-side-bar">
                <UserImg imgUrl={loggedinUser && loggedinUser.imgUrl} />
                {setIsPostLineRender() && <div className="post-line"></div>}
              </div>
              <div className="post-preview-main-container">
                <div className="post-preview-body">
                  <p className="post-preview-text">{setText()}</p>
                  {newPost && newPost.imgs && newPost.imgs.length > 0 && (
                    <PostImg
                      imgs={newPost.imgs.map((img, idx) => {
                        return { url: img.url, sortOrder: idx };
                      })}
                    />
                  )}
                  {newPost && newPost.videoUrl && (
                    <VideoPlayer videoUrl={newPost.videoUrl} isCustomControls={true} />
                  )}
                  {newPost && newPost.gif && <GifDisplay gif={newPost.gif} />}
                  {newPost && newPost.poll && <PollEdit currNewPost={newPost} />}
                </div>
              </div>
            </div>
          </article>
        );
      else return <PostNotAvailableMsg />;
    case "reply":
      if (post)
        return (
          <article className={`mini-post-preview ${type}`}>
            <div className="post-preview-content-wrapper">
              <div className="mini-post-preview-side-bar">
                <UserImg imgUrl={loggedinUser && loggedinUser.imgUrl} />
                {setIsPostLineRender() && <div className="post-line"></div>}
              </div>
              <div className="post-preview-main-container">
                <div className="post-preview-body">
                  <p className="post-preview-text">{setText()}</p>
                </div>
                {post?.repliedPostDetails && post.repliedPostDetails.length > 0 && (
                  <PostRepliedToUsersList repliedPostDetails={post.repliedPostDetails} />
                )}
              </div>
            </div>
          </article>
        );
      else return <PostNotAvailableMsg />;
    case "quote":
      if (quotedPost)
        return (
          <article className={`mini-post-preview ${type}`} onClick={onNavigateToPost}>
            <div className="post-preview-content-wrapper">
              <div className="post-preview-main-container">
                <header className="post-preview-header">
                  <div className="post-preview-header-main">
                    <div className="user-info">
                      <UserImg imgUrl={loggedinUser && loggedinUser.imgUrl} />
                      <h3>{quotedPost.createdBy.fullname}</h3>
                      <span>@{quotedPost.createdBy.username}</span>
                      {quotedPost.createdBy.isVerified && (
                        <BlueCheckMark className="post-preview-blue-check-mark" />
                      )}
                      {quotedPost.createdBy.isAdmin && <Logo />}
                    </div>
                    <span className="post-preview-header-dot">·</span>
                    <div className="post-time">
                      <span>{utilService.formatTime(quotedPost.createdAt)}</span>
                    </div>
                  </div>
                </header>
                <div className="post-preview-body">
                  <p className="post-preview-text">{setText()}</p>
                  {quotedPost.imgs && quotedPost.imgs.length > 0 && (
                    <PostImg
                      imgs={quotedPost.imgs.map((img, idx) => {
                        return { url: img.url, sortOrder: idx };
                      })}
                    />
                  )}
                  {quotedPost.videoUrl && (
                    <VideoPlayer videoUrl={quotedPost.videoUrl} isCustomControls={true} />
                  )}
                  {quotedPost.gif && <GifDisplay gif={quotedPost.gif} />}
                  {quotedPost.poll && <span className="link-to-poll">Show this poll</span>}
                </div>
              </div>
            </div>
          </article>
        );
      else return <PostNotAvailableMsg />;
    default:
      return <PostNotAvailableMsg />;
  }
};
