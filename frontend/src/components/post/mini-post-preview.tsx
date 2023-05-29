import { NewPost } from "../../../../shared/interfaces/post.interface";
import { UserImg } from "../user/user-img";
import { PostImg } from "./post-img";
import { GifDisplay } from "../gif/gif-display";
import { userService } from "../../services/user.service";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { VideoPlayer } from "../video/video-player";
import { PollEdit } from "../poll/poll-edit";
import { setCurrNewPost } from "../../store/actions/post.actions";
import { AppDispatch } from "../../store/types";

interface MiniPostPreviewProps {
  newPost: NewPost;
}

export const MiniPostPreview: React.FC<MiniPostPreviewProps> = ({ newPost }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { newPostType } = useSelector((state: RootState) => state.postModule.newPostState);
  const dispatch: AppDispatch = useDispatch();

  const onSetCurrPost = (currPost: NewPost) => {
    dispatch(setCurrNewPost(currPost, newPostType));
  };

  return (
    <article className="mini-post-preview" onClick={() => onSetCurrPost(newPost)}>
      <div className="mini-post-preview-side-bar">
        <UserImg
          imgUrl={(loggedinUser && loggedinUser.imgUrl) || userService.getDefaultUserImgUrl()}
        />
        <div className="post-line"></div>
      </div>
      <div className="post-preview-main-container">
        <div className="post-preview-body">
          <p className="post-preview-text">{newPost.text || "Add another Chirp!"}</p>
          {newPost.imgs && newPost.imgs.length > 0 && (
            <PostImg
              imgs={newPost.imgs.map((img, idx) => {
                return { url: img.url, sortOrder: idx };
              })}
            />
          )}
          {newPost.videoUrl && <VideoPlayer videoUrl={newPost.videoUrl} isCustomControls={true} />}
          {newPost.gif && <GifDisplay gif={newPost.gif} />}
          {newPost.poll && <PollEdit currNewPost={newPost} />}
        </div>
      </div>
    </article>
  );
};
