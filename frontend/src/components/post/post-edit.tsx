import { ReactElement, useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { FaGlobeAmericas } from "react-icons/fa";
import { BtnCreatePost } from "../btns/btn-create-post";
import { PostEditActionBtns } from "../btns/post-edit-action-btns";
import { TextIndicator } from "../other/text-indicator";
import { AiOutlinePlus } from "react-icons/ai";
import { NewPost, Poll } from "../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../store/types";
import { addPost, setNewPost } from "../../store/actions/post.actions";
import { PostEditImg } from "./post-edit-img-container";
import { Gif as GifType } from "../../../../shared/interfaces/gif.interface";
import { Gif } from "../gif/gif";
import { BtnClose } from "../btns/btn-close";
import { UserImg } from "../user/user-img";
import { BtnToggleAudience } from "../btns/btn-toggle-audience";
import { BtnToggleRepliers } from "../btns/btn-toggle-repliers";
import { PollEdit } from "../poll/poll-edit";
import { PostDateTitle } from "../other/post-date-title";
import { IoLocationSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { uploadImgToCloudinary } from "../../services/upload.service";

interface PostEditProps {
  isHomePage?: boolean;
  onClickBtnClose?: () => void;
}

interface audienceSettings {
  title: string;
  value: string;
}

interface repliersSetting {
  title: string;
  icon: ReactElement;
  value: string;
}
export interface postSettings {
  audience: audienceSettings;
  repliersType: repliersSetting;
}

export const PostEdit: React.FC<PostEditProps> = ({ isHomePage = false, onClickBtnClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { newPost }: { newPost: NewPost } = useSelector((state: RootState) => state.postModule);

  const [imgUrls, setImgUrls] = useState<{ url: string; isLoading: boolean; file: File }[]>([]);
  const [gifUrl, setGifUrl] = useState<GifType | null>(null);
  const [isPickerShown, setIsPickerShown] = useState<boolean>(!isHomePage);
  const [poll, setPoll] = useState<Poll | null>(null);

  const [postSettings, setPostSettings] = useState<{
    audience: audienceSettings;
    repliersType: repliersSetting;
  }>({
    audience: {
      title: "Everyone",
      value: "everyone",
    },
    repliersType: {
      title: "Everyone",
      icon: <FaGlobeAmericas />,
      value: "everyone",
    },
  });

  const [isBtnCreatePostDisabled, setIsBtnCreatePostDisabled] = useState<boolean>(true);
  const [postSaveInProgress, setPostSaveInProgress] = useState<boolean>(false);

  useEffect(() => {
    if ((newPost.text.length > 0 && newPost.text.length <= 247) || imgUrls.length > 0 || gifUrl) {
      setIsBtnCreatePostDisabled(false);
    } else {
      setIsBtnCreatePostDisabled(true);
    }
  }, [newPost, imgUrls, gifUrl]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    dispatch(setNewPost({ ...newPost, text }));
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const onAddPost = async () => {
    try {
      setPostSaveInProgress(true);
      if (!loggedinUser) return;
      newPost.userId = loggedinUser.id;

      if (imgUrls.length > 0) {
        const prms = imgUrls.map(async (img, idx) => {
          const currImgUrl = await uploadImgToCloudinary(img.file);
          return { url: currImgUrl, sortOrder: idx };
        });
        const savedImgUrl = await Promise.all(prms);
        newPost.imgUrls = savedImgUrl.filter((img) => img.url);
      }

      if (gifUrl) newPost.gifUrl = gifUrl;
      if (poll) newPost.poll = { ...poll };
      await dispatch(addPost(newPost));

      dispatch(
        setNewPost({
          text: "",
          audience: "everyone",
          repliersType: "everyone",
        } as NewPost)
      );

      setIsPickerShown(false);
      setImgUrls([]);
      setGifUrl(null);
      setPoll(null);
      setPostSaveInProgress(false);
      setIsBtnCreatePostDisabled(true);
    } catch (err) {
      setPostSaveInProgress(false);
      console.log(err);
    }
  };

  const openPicker = () => {
    if (isHomePage && !isPickerShown) {
      setIsPickerShown(true);
      textAreaRef.current?.focus();
    }
  };

  const onGoToLocationPage = () => {
    if (!isPickerShown) return;
    navigate("post-location");
  };

  return (
    <section
      className={"post-edit" + (postSaveInProgress ? " save-mode" : "")}
      onClick={openPicker}
    >
      {onClickBtnClose && <BtnClose onClickBtn={onClickBtnClose} />}
      {postSaveInProgress && <span className="progress-bar"></span>}

      <div className="content-container">
        {loggedinUser && <UserImg imgUrl={loggedinUser?.imgUrl} />}

        <main className={"main-content" + (isHomePage && !isPickerShown ? " gap-0" : "")}>
          {isPickerShown && (
            <BtnToggleAudience postSettings={postSettings} setPostSettings={setPostSettings} />
          )}
          {newPost.schedule && <PostDateTitle date={newPost.schedule} isLink={isPickerShown} />}
          <textarea
            className={
              "post-edit-text-area" +
              (isHomePage ? " home-page-height" : "") +
              (isHomePage && !isPickerShown ? " pt-10" : "")
            }
            placeholder={poll ? "Ask a question..." : "What's happening?"}
            value={newPost.text}
            onChange={handleTextChange}
            ref={textAreaRef}
          />
          {imgUrls.length > 0 && <PostEditImg imgUrls={imgUrls} setImgUrls={setImgUrls} />}

          {gifUrl && <Gif gifUrl={gifUrl} setGifUrl={setGifUrl} />}
          {poll && <PollEdit poll={poll} setPoll={setPoll} />}

          <div className="btn-replires-location-container">
            {isPickerShown && (
              <BtnToggleRepliers postSettings={postSettings} setPostSettings={setPostSettings} />
            )}
            {newPost.location && (
              <div className="post-edit-location-title" onClick={onGoToLocationPage}>
                <IoLocationSharp /> {newPost.location.name}
              </div>
            )}
          </div>
          <div className={"btns-container" + (isPickerShown ? " border-show" : "")}>
            <PostEditActionBtns
              imgUrls={imgUrls}
              setImgUrls={setImgUrls}
              gifUrl={gifUrl}
              setGifUrl={setGifUrl}
              isPickerShown={isPickerShown}
              poll={poll}
              setPoll={setPoll}
            />
            <div className="secondary-action-container">
              {newPost.text.length > 0 && (
                <div className="indicator-thread-btn-container">
                  <TextIndicator textLength={newPost.text.length} />
                  <hr className="vertical" />
                  <button className="btn-add-thread">
                    <AiOutlinePlus className="btn-add-thread-icon" />
                  </button>
                </div>
              )}
              <BtnCreatePost
                isLinkToNestedPage={false}
                isDisabled={isBtnCreatePostDisabled}
                onAddPost={onAddPost}
              />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};
