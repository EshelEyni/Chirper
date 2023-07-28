import { useSelector } from "react-redux";
import { NewPost } from "../../../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../../../store/store";
import { UserImg } from "../../../../User/UserImg/UserImg";
import { PostImg } from "../../../PostImg/PostImg";
import { VideoPlayer } from "../../../../Video/VideoPlayer/VideoPlayer";
import { GifDisplay } from "../../../../Gif/GifDisplay/GifDisplay";
import { PollEdit } from "../../../../Poll/PollEdit/PollEdit";
import { PostPreviewMainContainer } from "../../MainContainer/PostPreviewMainContainer";
import { PostPreviewBody } from "../../Body/PostPreviewBody";
import { PostPreviewText } from "../../Text/PostPreviewText";

type NewPostContentProps = {
  newPost: NewPost;
};

export const NewPostContent: React.FC<NewPostContentProps> = ({ newPost }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { homePage, sideBar, newPostType } = useSelector((state: RootState) => state.newPostModule);
  const isPostLineShowned = setIsPostLineRender();
  const isPlainText = newPost?.text ? true : false;
  const isImgShown = newPost?.imgs && newPost.imgs.length > 0;

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

  function getText() {
    if (newPost?.text) return newPost.text;
    const currPostIdx = getCurrPostIdx();
    if (currPostIdx === 0) return "What's happening?";
    return "Add another Chirp!";
  }

  return (
    <>
      <div className="mini-post-preview-side-bar">
        <UserImg imgUrl={loggedinUser && loggedinUser.imgUrl} />
        {isPostLineShowned && <div className="post-line" />}
      </div>
      <PostPreviewMainContainer>
        <PostPreviewBody>
          <PostPreviewText text={getText()} isPlainText={isPlainText} />
          {isImgShown && (
            <PostImg
              imgs={newPost.imgs.map((img, idx) => {
                return { url: img.url, sortOrder: idx };
              })}
            />
          )}
          {newPost.videoUrl && <VideoPlayer videoUrl={newPost.videoUrl} isCustomControls={true} />}
          {newPost.gif && <GifDisplay gif={newPost.gif} isAutoPlay={false} />}
          {newPost.poll && <PollEdit currNewPost={newPost} />}
        </PostPreviewBody>
      </PostPreviewMainContainer>
    </>
  );
};
