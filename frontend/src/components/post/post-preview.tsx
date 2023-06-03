import { Post } from "../../../../shared/interfaces/post.interface";
import { utilService } from "../../services/util.service/utils.service";
import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import { PostPreviewActions } from "./post-preview-actions";
import { UserImg } from "../user/user-img";
import { PostImg } from "./post-img";
import { GifDisplay } from "../gif/gif-display";
import { userService } from "../../services/user.service";
import { PollDisplay } from "../poll/poll-display";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { ReactComponent as BlueCheckMark } from "../../assets/svg/blue-check-mark.svg";
import { Logo } from "../other/logo";
import { VideoPlayer } from "../video/video-player";
import { PostRepliedToUsersList } from "./post-replied-to-users-list";

interface PostPreviewProps {
  post: Post;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const isLoggedinUserPost = loggedinUser?.id === post.user.id;
  const postStartDate = post.schedule ? post.schedule : post.createdAt;
  const [poll, setPoll] = useState(post.poll || null);

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

  return (
    <article className="post-preview">
      <UserImg imgUrl={post.user.imgUrl || userService.getDefaultUserImgUrl()} />
      <div className="post-preview-main-container">
        <header className="post-preview-header">
          <div className="post-preview-header-main">
            <div className="user-info">
              <h3>{post.user.fullname}</h3>
              <span>@{post.user.username}</span>
              {post.user.isVerified && <BlueCheckMark className="post-preview-blue-check-mark" />}
              {post.user.isAdmin && <Logo />}
            </div>
            <span className="post-preview-header-dot">·</span>
            <div className="post-time">
              <span>{utilService.formatTime(post.createdAt)}</span>
            </div>
          </div>
          <div className="post-preview-header-options-container">
            <IoEllipsisHorizontalSharp />
          </div>
        </header>
        <div className="post-preview-body">
          {post.repliedPostDetails && post.repliedPostDetails.length > 0 && (
            <PostRepliedToUsersList repliedPostDetails={post.repliedPostDetails} />
          )}
          <p
            className="post-preview-text"
            dangerouslySetInnerHTML={{ __html: formmatText(post.text) }}
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
        </div>
        <footer className="flex">
          <PostPreviewActions post={post} />
        </footer>
      </div>
    </article>
  );
};
