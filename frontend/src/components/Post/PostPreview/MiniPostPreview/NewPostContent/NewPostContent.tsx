import { useSelector } from "react-redux";
import { NewPost } from "../../../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../../../store/store";
import { postService } from "../../../../../services/post.service";
import { UserImg } from "../../../../User/UserImg/UserImg";
import { PostImg } from "../../../PostImg/PostImg";
import { VideoPlayer } from "../../../../Video/VideoPlayer/VideoPlayer";
import { GifDisplay } from "../../../../Gif/GifDisplay/GifDisplay";
import { PollEdit } from "../../../../Poll/PollEdit/PollEdit";

type NewPostContentProps = {
  newPost: NewPost;
};

export const NewPostContent: React.FC<NewPostContentProps> = ({ newPost }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { homePage, sideBar, newPostType } = useSelector((state: RootState) => state.newPostModule);
  const isPostLineShowned = setIsPostLineRender();

  function getCurrPostIdx() {
    if (!newPost) return -1;
    if (newPostType === "home-page")
      return homePage.posts.findIndex(p => p.tempId === newPost?.tempId);
    else if (newPostType === "side-bar")
      return sideBar.posts.findIndex(p => p.tempId === newPost?.tempId);
  }

  function setIsPostLineRender() {
    if (newPostType === "home-page") {
      const currPostIdx = getCurrPostIdx();
      return currPostIdx !== homePage.posts.length - 1;
    } else if (newPostType === "side-bar") {
      const currPostIdx = getCurrPostIdx();
      return currPostIdx !== sideBar.posts.length - 1;
    } else return false;
  }

  function setText() {
    const currPostIdx = getCurrPostIdx();
    if (newPost?.text) return newPost.text;
    if (currPostIdx === 0) return "What's happening?";
    return "Add another Chirp!";
  }

  return (
    <>
      <div className="mini-post-preview-side-bar">
        <UserImg imgUrl={loggedinUser && loggedinUser.imgUrl} />
        {isPostLineShowned && <div className="post-line" />}
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
