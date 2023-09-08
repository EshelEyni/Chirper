import { FC } from "react";
import postService from "../../../../services/post.service";
import { useNavigate } from "react-router-dom";
import "./PostPreviewText.scss";
import { LoggedInUserActionState } from "../../../../../../shared/types/post.interface";

type PostPreviewTextProps = {
  text: string;
  isPlainText: boolean;
  postId?: string;
  loggedInUserActionState?: LoggedInUserActionState;
};

export const PostPreviewText: FC<PostPreviewTextProps> = ({
  text,
  isPlainText,
  postId,
  loggedInUserActionState,
}) => {
  const navigate = useNavigate();

  function formatPostText(text: string): string {
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

    // const lineBreaks = formmatedText.match(/\n/g);
    // if (lineBreaks) {
    //   formmatedText = formmatedText.replaceAll("\n", "<br />");
    // }

    return formmatedText;
  }

  const handleLinkClick = async (e: React.MouseEvent) => {
    if (!loggedInUserActionState) return;
    if (e.target instanceof HTMLAnchorElement) {
      e.preventDefault();
      const type = e.target.dataset.type;
      if (type === "hashtag") {
        if (postId && !loggedInUserActionState.isHashTagClicked)
          await postService.updatePostStats(postId, { isHashTagClicked: true });
        const url = e.target.dataset.url;
        navigate(`/explore/${url}`);
      } else if (type === "profile-link") {
        const url = e.target.href;
        const username = url.slice(url.lastIndexOf("/") + 1);
        navigate(`/profile/${username}`);
      } else if (type === "external-link") {
        if (postId && !loggedInUserActionState.isLinkClicked)
          await postService.updatePostStats(postId, { isLinkClicked: true });
        window.open(e.target.href, "_blank");
      }
    }
  };
  return (
    <div>
      {isPlainText ? (
        <p className="post-preview-text">{text}</p>
      ) : (
        <p
          className="post-preview-text"
          dangerouslySetInnerHTML={{ __html: formatPostText(text) }}
          onClick={handleLinkClick}
        ></p>
      )}
    </div>
  );
};
