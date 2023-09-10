import { useSelector } from "react-redux";
import { NewPost } from "../../../../../shared/types/post.interface";
import { RootState } from "../../../store/store";
import { PostImg } from "../PostImgList/PostImgList";
import { VideoPlayer } from "../../Video/VideoPlayer/VideoPlayer";
import { GifDisplay } from "../../Gif/GifDisplay/GifDisplay";
import { PollEdit } from "../../Poll/PollEdit/PollEdit";
import { PostPreviewMainContainer } from "./PostPreviewMainContainer";
import { PostPreviewBody } from "./PostPreviewBody";
import { PostPreviewText } from "./PostPreviewText";
import { MiniPostPreviewAside } from "./MiniPostPreviewAside";
import { useMemo } from "react";
import { VideoPlayerProvider } from "../../../contexts/VideoPlayerContext";
import { NewPostType } from "../../../store/slices/postEditSlice";

type NewPostContentProps = {
  newPost: NewPost;
};

export const NewPostContent: React.FC<NewPostContentProps> = ({ newPost }) => {
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const { postEdit } = useSelector((state: RootState) => state);
  const { newPostType } = postEdit;
  const isPlainText = newPost?.text ? true : false;
  const isImgShown = newPost?.imgs && newPost.imgs.length > 0;

  const currPostIdx = useMemo(() => {
    if (!newPost) return -1;
    const isThread = newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar;
    if (!isThread) return -1;
    return postEdit[newPostType].posts.findIndex(p => p.tempId === newPost?.tempId);
  }, [newPost, newPostType, postEdit]);

  const isPostLineShown = useMemo(() => {
    const isThread = newPostType === NewPostType.HomePage || newPostType === NewPostType.SideBar;
    if (!isThread) return false;
    return postEdit[newPostType].currPostIdx !== postEdit[newPostType].posts.length - 1;
  }, [newPostType, postEdit]);

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
          {isImgShown && <PostImg post={newPost} />}
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
