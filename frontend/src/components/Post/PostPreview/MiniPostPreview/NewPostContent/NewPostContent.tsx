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

type NewPostContentProps = {
  newPost: NewPost;
};

export const NewPostContent: React.FC<NewPostContentProps> = ({ newPost }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { homePage, sideBar, newPostType } = useSelector((state: RootState) => state.newPostModule);
  const isPlainText = newPost?.text ? true : false;
  const isImgShown = newPost?.imgs && newPost.imgs.length > 0;

  const currPostIdx = useMemo(() => {
    if (!newPost) return -1;
    if (newPostType === NewPostType.HomePage)
      return homePage.posts.findIndex(p => p.tempId === newPost?.tempId);
    else if (newPostType === NewPostType.SideBar)
      return sideBar.posts.findIndex(p => p.tempId === newPost?.tempId);
  }, [newPost, newPostType, homePage.posts, sideBar.posts]);

  const isPostLineShown = useMemo(() => {
    if (newPostType === NewPostType.HomePage) return currPostIdx !== homePage.posts.length - 1;
    else if (newPostType === NewPostType.SideBar) return currPostIdx !== sideBar.posts.length - 1;
    else return false;
  }, [newPostType, homePage.posts, sideBar.posts, currPostIdx]);

  function getText() {
    if (newPost?.text) return newPost.text;
    if (currPostIdx === 0) return "What's happening?";
    return "Add another Chirp!";
  }

  return (
    <>
      <MiniPostPreviewAside userImgUrl={loggedinUser!.imgUrl} isPostLineShowned={isPostLineShown} />
      <PostPreviewMainContainer>
        <PostPreviewBody>
          <PostPreviewText text={getText()} isPlainText={isPlainText} />
          {isImgShown && (
            <PostImg imgs={newPost.imgs.map((img, idx) => ({ url: img.url, sortOrder: idx }))} />
          )}
          {newPost.videoUrl && <VideoPlayer videoUrl={newPost.videoUrl} isCustomControls={true} />}
          {newPost.gif && <GifDisplay gif={newPost.gif} isAutoPlay={false} />}
          {newPost.poll && <PollEdit currNewPost={newPost} />}
        </PostPreviewBody>
      </PostPreviewMainContainer>
    </>
  );
};
