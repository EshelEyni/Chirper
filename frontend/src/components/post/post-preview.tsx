import { Post } from "../../../../shared/interfaces/post.interface";
import { utilService } from "../../services/util.service/utils.service";
import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import { PostPreviewActionBtns } from "../btns/post-preview-action-brns";
import { UserImg } from "../user/user-img";
import { PostImg } from "./post-img";
import { GifDisplay } from "../gif/gif-display";
import { userService } from "../../services/user.service";
import { PollDisplay } from "../poll/poll-display";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface PostPreviewProps {
  post: Post;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ post }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const isLoggedinUserPost = loggedinUser?.id === post.user.id;
  const postStartDate = post.schedule ? post.schedule : post.createdAt;
  const [poll, setPoll] = useState(post.poll || null);

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
          <p>{post.text}</p>
          {post.imgs && post.imgs.length > 0 && <PostImg imgs={post.imgs} />}
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
          <PostPreviewActionBtns post={post} />
        </footer>
      </div>
    </article>
  );
};
