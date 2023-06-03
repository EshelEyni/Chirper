import { NewPost, Post } from "../../../../shared/interfaces/post.interface";
import { UserImg } from "../user/user-img";
import { PostImg } from "./post-img";
import { GifDisplay } from "../gif/gif-display";
import { userService } from "../../services/user.service";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { VideoPlayer } from "../video/video-player";
import { PollEdit } from "../poll/poll-edit";
import { AppDispatch } from "../../store/types";
import { setNewPost } from "../../store/actions/new-post.actions";
import { PostRepliedToUsersList } from "./post-replied-to-users-list";

interface MiniPostPreviewProps {
  newPost?: NewPost;
  post?: Post;
}

export const MiniPostPreview: React.FC<MiniPostPreviewProps> = ({ newPost, post }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { homePage, sideBar, newPostType } = useSelector((state: RootState) => state.newPostModule);
  const dispatch: AppDispatch = useDispatch();

  const onSetCurrPost = (currPost: NewPost | undefined) => {
    if (!currPost) return;
    dispatch(setNewPost(currPost, newPostType));
  };

  const setText = () => {
    if (newPost) {
      if (newPost.text) return newPost.text;
      if (newPost.idx === 0) return "What's happening?";
      return "Add another Chirp!";
    } else if (post) {
      return post.text;
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

  return (
    <article
      className={"mini-post-preview" + (post ? " reply" : "")}
      onClick={() => onSetCurrPost(newPost)}
    >
      <div className="mini-post-preview-side-bar">
        <UserImg
          imgUrl={(loggedinUser && loggedinUser.imgUrl) || userService.getDefaultUserImgUrl()}
        />
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
        {post?.repliedPostDetails && post.repliedPostDetails.length > 0 && (
          <PostRepliedToUsersList repliedPostDetails={post.repliedPostDetails} />
        )}
      </div>
    </article>
  );
};
