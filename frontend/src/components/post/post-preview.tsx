import { Post } from "../../../../shared/interfaces/post.interface";
import { utilService } from "../../services/util.service/utils.service";
import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import { PostPreviewActionBtns } from "../btns/post-preview-action-brns";
import { UserImg } from "../user/user-img";
import { PostImg } from "./post-img";
import { GifDisplay } from "../gif/gif-display";
import { userService } from "../../services/user.service";

interface PostPreviewProps {
  post: Post;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  return (
    <article className="post-preview">
      <div className="user-img-container">
        <UserImg imgUrl={post.user.imgUrl || userService.getDefaultUserImgUrl()} />
      </div>
      <div className="post-preview-main-container">
        <header className="post-preview-header">
          <div className="post-preview-header-main">
            <div className="user-info">
              <h3>{post.user.fullname}</h3>
              <span>@{post.user.username}</span>
            </div>
            <span>·</span>
            <div className="post-time">
              <span>{utilService.formatTime(post.createdAt)}</span>
            </div>
          </div>
          <div className="post-preview-header-options-container">
            <IoEllipsisHorizontalSharp />
          </div>
        </header>
        <div className="post-preview-body">
          <p>{post.text}</p>
          {post.imgs && post.imgs.length > 0 && <PostImg imgs={post.imgs} />}
          {post.gif && <GifDisplay gif={post.gif} />}
          {post.poll && (
            <div className="poll-container">
              <ul>
                {post.poll.options.map((option, idx) => (
                  <li key={idx}>
                    <span>{option}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <footer className="flex">
          <PostPreviewActionBtns post={post} />
        </footer>
      </div>
    </article>
  );
};
