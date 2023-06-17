import { useSelector } from "react-redux";
import { NewPost } from "../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../store/store";
import { UserImg } from "../../user/user-img";
import { postService } from "../../../services/post.service";
import { PostImg } from "../post-img";
import { VideoPlayer } from "../../video/video-player";
import { GifDisplay } from "../../gif/gif-display";
import { PollEdit } from "../../poll/poll-edit";

type NewPostContentProps = {
  newPost: NewPost;
};

export const NewPostContent: React.FC<NewPostContentProps> = ({ newPost }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { homePage, sideBar, newPostType } = useSelector((state: RootState) => state.newPostModule);

  const setIsPostLineRender = () => {
    if (newPostType === "home-page") {
      const currPostIdx = getCurrPostIdx();
      return currPostIdx !== homePage.posts.length - 1;
    } else if (newPostType === "side-bar") {
      const currPostIdx = getCurrPostIdx();
      return currPostIdx !== sideBar.posts.length - 1;
    } else return false;
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

  const setText = () => {
    const currPostIdx = getCurrPostIdx();
    if (newPost?.text) return newPost.text;
    if (currPostIdx === 0) return "What's happening?";
    return "Add another Chirp!";
  };

  return (
    <>
      <div className="mini-post-preview-side-bar">
        <UserImg imgUrl={loggedinUser && loggedinUser.imgUrl} />
        {setIsPostLineRender() && <div className="post-line"></div>}
      </div>
      <div className="post-preview-main-container">
        <div className="post-preview-body">
          <p
            className="post-preview-text"
            dangerouslySetInnerHTML={{
              __html: postService.formatPostText(setText() || ""),
            }}
          ></p>
          {newPost.imgs && newPost.imgs.length > 0 && (
            <PostImg
              imgs={newPost.imgs.map((img, idx) => {
                return { url: img.url, sortOrder: idx };
              })}
            />
          )}
          {newPost.videoUrl && <VideoPlayer videoUrl={newPost.videoUrl} isCustomControls={true} />}
          {newPost.gif && <GifDisplay gif={newPost.gif} isAutoPlay={false} />}
          {newPost.poll && <PollEdit currNewPost={newPost} />}
        </div>
      </div>
    </>
  );
};
