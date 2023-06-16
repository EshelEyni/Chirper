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
import { PostPreviewHeader } from "./post-preview-header";

interface MiniPostPreviewProps {
  newPost?: NewPost;
  post?: Post;
  quotedPost?: QuotedPost;
  type: MiniPostPreviewType;
}

export type MiniPostPreviewType = "new-post" | "reply" | "quote" | "snapshot-post-stats";

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
      case "new-post": {
        const currPostIdx = getCurrPostIdx();
        if (newPost?.text) return newPost.text;
        if (currPostIdx === 0) return "What's happening?";
        return "Add another Chirp!";
      }
      case "reply":
        return post?.text;
      case "quote":
        return quotedPost?.text;
      case "snapshot-post-stats":
        return post?.text;
      default:
        return "Text not found";
    }
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
          `<a href="${url}" target="_blank">${trimmedUrl}</a>`
        );
      });
    }
    // const hashtags = text.match(/#[^\s]+/g);
    // if (hashtags) {
    //   hashtags.forEach(hashtag => {
    //     const sanitizedHashtag = sanitizeHtml(hashtag);
    //     formmatedText = formmatedText.replace(
    //       hashtag,
    //       `<a href="/explore/tags/${sanitizedHashtag.slice(
    //         1
    //       )}" target="_blank">${sanitizedHashtag}</a>`
    //     );
    //   });
    // }
    // const mentions = text.match(/@[^\s]+/g);
    // if (mentions) {
    //   mentions.forEach(mention => {
    //     const sanitizedMention = sanitizeHtml(mention);
    //     formmatedText = formmatedText.replace(
    //       mention,
    //       `<a href="/${sanitizedMention.slice(1)}" target="_blank">${sanitizedMention}</a>`
    //     );
    //   });
    // }

    const lineBreaks = formmatedText.match(/\n/g);
    if (lineBreaks) {
      formmatedText = formmatedText.replaceAll("\n", "<br />");
    }

    return formmatedText;
  };

  const setIsPostLineRender = () => {
    if (newPost) {
      if (newPostType === "home-page") {
        const currPostIdx = getCurrPostIdx();
        return currPostIdx !== homePage.posts.length - 1;
      } else if (newPostType === "side-bar") {
        const currPostIdx = getCurrPostIdx();
        return currPostIdx !== sideBar.posts.length - 1;
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

  const getCurrPostIdx = () => {
    if (newPost) {
      if (newPostType === "home-page") {
        return homePage.posts.findIndex(p => p.tempId === newPost?.tempId);
      } else if (newPostType === "side-bar") {
        return sideBar.posts.findIndex(p => p.tempId === newPost?.tempId);
      }
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
                  <p
                    className="post-preview-text"
                    dangerouslySetInnerHTML={{ __html: formmatText(setText() || "") }}
                  ></p>
                  {newPost.imgs && newPost.imgs.length > 0 && (
                    <PostImg
                      imgs={newPost.imgs.map((img, idx) => {
                        return { url: img.url, sortOrder: idx };
                      })}
                    />
                  )}
                  {newPost.videoUrl && (
                    <VideoPlayer videoUrl={newPost.videoUrl} isCustomControls={true} />
                  )}
                  {newPost.gif && <GifDisplay gif={newPost.gif} isAutoPlay={false} />}
                  {newPost.poll && <PollEdit currNewPost={newPost} />}
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
                <PostPreviewHeader post={quotedPost} isMiniPreview={true} />
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
                  {quotedPost.gif && <GifDisplay gif={quotedPost.gif} isAutoPlay={false} />}
                  {quotedPost.poll && <span className="link-to-poll">Show this poll</span>}
                </div>
              </div>
            </div>
          </article>
        );
      else return <PostNotAvailableMsg />;
    case "snapshot-post-stats":
      if (post)
        return (
          <article className={`mini-post-preview ${type}`} onClick={onNavigateToPost}>
            <div className="post-preview-content-wrapper">
              <div className="post-preview-main-container">
                <PostPreviewHeader post={post} isMiniPreview={true} />
                <div className="post-preview-body">
                  <p className="post-preview-text">{setText()}</p>
                  {post.imgs && post.imgs.length > 0 && (
                    <PostImg
                      imgs={post.imgs.map((img, idx) => {
                        return { url: img.url, sortOrder: idx };
                      })}
                    />
                  )}
                  {post.videoUrl && (
                    <VideoPlayer videoUrl={post.videoUrl} isCustomControls={true} />
                  )}
                  {post.gif && <GifDisplay gif={post.gif} isAutoPlay={false} />}
                  {post.poll && <span className="link-to-poll">Show this poll</span>}
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
