import { useSelector } from "react-redux";
import { NewPost } from "../../../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../../../store/store";
import { PostImg } from "../../../PostImgList/PostImgList";
import { VideoPlayer } from "../../../../Video/VideoPlayer/VideoPlayer";
import { GifDisplay } from "../../../../Gif/GifDisplay/GifDisplay";
import { PollEdit } from "../../../../Poll/PollEdit/PollEdit";
import { PostPreviewMainContainer } from "../../MainContainer/PostPreviewMainContainer";
import { PostPreviewBody } from "../../Body/PostPreviewBody";
import { PostPreviewText } from "../../Text/PostPreviewText";
import { MiniPostPreviewAside } from "../Aside/MiniPostPreviewAside";
import { useMemo } from "react";
import { NewPostType } from "../../../../../store/reducers/new-post.reducer";
import { VideoPlayerProvider } from "../../../../../contexts/VideoPlayerContext";

type NewPostContentProps = {
  newPost: NewPost;
};

export const NewPostContent: React.FC<NewPostContentProps> = ({ newPost }) => {
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const { newPostModule } = useSelector((state: RootState) => state);
  const { newPostType } = newPostModule;
  const isPlainText = newPost?.text ? true : false;
  const isImgShown = newPost?.imgs && newPost.imgs.length > 0;

  const currPostIdx = useMemo(() => {
    if (!newPost) return -1;
    const isThread = newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar;
    if (!isThread) return -1;
    return newPostModule[newPostType].posts.findIndex(p => p.tempId === newPost?.tempId);
  }, [newPost, newPostType, newPostModule]);

  const isPostLineShown = useMemo(() => {
    const isThread = newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar;
    if (!isThread) return false;
    return newPostModule[newPostType].currPostIdx !== newPostModule[newPostType].posts.length - 1;
  }, [newPostType, newPostModule]);

  function getText() {
    if (newPost?.text) return newPost.text;
    if (currPostIdx === 0) return "What's happening?";
    return "Add another Chirp!";
  }

  return (
    <>
      <MiniPostPreviewAside userImgUrl={loggedInUser?.imgUrl} isPostLineShowned={isPostLineShown} />
      <PostPreviewMainContainer>
        <PostPreviewBody>
          <PostPreviewText text={getText()} isPlainText={isPlainText} />
          {isImgShown && (
            <PostImg imgs={newPost.imgs.map((img, idx) => ({ url: img.url, sortOrder: idx }))} />
          )}
          {newPost.videoUrl && (
            <VideoPlayerProvider>
              <VideoPlayer videoUrl={newPost.videoUrl} isCustomControls={true} />
            </VideoPlayerProvider>
          )}
          {newPost.gif && <GifDisplay gif={newPost.gif} isAutoPlay={false} />}
          {newPost.poll && <PollEdit />}
        </PostPreviewBody>
      </PostPreviewMainContainer>
    </>
  );
};
