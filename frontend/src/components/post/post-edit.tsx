import { ReactElement, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { FaGlobeAmericas } from "react-icons/fa";
import { BtnCreatePost } from "../btns/btn-create-post";
import { PostEditActionBtns } from "../btns/post-edit-action-btns";
import { TextIndicator } from "../other/text-indicator";
import { AiOutlinePlus } from "react-icons/ai";
import { NewPost, Poll } from "../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../store/types";
import { addPost } from "../../store/actions/post.actions";
import { PostEditImg } from "./post-edit-img-container";
import { GifUrl } from "../../../../shared/interfaces/gif.interface";
import { Gif } from "../gif/gif";
import { BtnClose } from "../btns/btn-close";
import { UserImg } from "../user/user-img";
import { BtnToggleAudience } from "../btns/btn-toggle-audience";
import { BtnToggleRepliers } from "../btns/btn-toggle-repliers";
import { PollEdit } from "../poll/poll-edit";

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

export const PostEdit: React.FC<PostEditProps> = ({
  isHomePage = false,
  onClickBtnClose,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);

  const [post, setPost] = useState<NewPost>({
    text: "",
    audience: "everyone",
    repliersType: "everyone",
  } as NewPost);
  const [imgUrls, setImgUrls] = useState<{ url: string; isLoading: boolean }[]>(
    []
  );
  const [gifUrl, setGifUrl] = useState<GifUrl | null>(null);
  const [isPickerShown, setIsPickerShown] = useState<boolean>(!isHomePage);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [schedule, setSchedule] = useState<Date | null>(null);
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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPost({ ...post, text });
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const onAddPost = async () => {
    if (!loggedinUser) return;
    const newPost: NewPost = {
      text: post.text,
      audience: post.audience,
      repliersType: post.repliersType,
      isPublic: true,
      user: {
        _id: loggedinUser._id,
        username: loggedinUser.username,
        fullname: loggedinUser.fullname,
        imgUrl: loggedinUser.imgUrl,
      },
    };

    if (imgUrls.length > 0) newPost.imgUrls = imgUrls.map((img) => img.url);
    if (gifUrl) newPost.gifUrl = gifUrl;
    if (poll) newPost.poll = { ...poll, createdAt: Date.now() };
    if (schedule) {
      post.isPublic = false;
      newPost.schedule = schedule;
    }
    await dispatch(addPost(newPost));
    setPost({
      text: "",
      audience: "everyone",
      repliersType: "everyone",
    } as NewPost);
    setIsPickerShown(false);
  };

  const openPicker = () => {
    if (isHomePage && !isPickerShown) {
      setIsPickerShown(true);
      textAreaRef.current?.focus();
    }
  };

  return (
    <section className="post-edit" onClick={openPicker}>
      {onClickBtnClose && <BtnClose onClickBtn={onClickBtnClose} />}

      <div className="content-container">
        {loggedinUser && <UserImg imgUrl={loggedinUser?.imgUrl} />}

        <main
          className={
            "main-content" + (isHomePage && !isPickerShown ? " gap-0" : "")
          }
        >
          {isPickerShown && (
            <BtnToggleAudience
              postSettings={postSettings}
              setPostSettings={setPostSettings}
            />
          )}
          <textarea
            className={
              "post-edit-text-area" +
              (isHomePage ? " home-page-height" : "") +
              (isHomePage && !isPickerShown ? " pt-10" : "")
            }
            placeholder={poll ? "Ask a question..." : "What's happening?"}
            value={post.text}
            onChange={handleTextChange}
            ref={textAreaRef}
          />
          {imgUrls.length > 0 && (
            <PostEditImg imgUrls={imgUrls} setImgUrls={setImgUrls} />
          )}

          {gifUrl && <Gif gifUrl={gifUrl} setGifUrl={setGifUrl} />}
          {poll && <PollEdit poll={poll} setPoll={setPoll} />}

          {isPickerShown && (
            <BtnToggleRepliers
              postSettings={postSettings}
              setPostSettings={setPostSettings}
            />
          )}

          <div
            className={"btns-container" + (isPickerShown ? " border-show" : "")}
          >
            <PostEditActionBtns
              post={post}
              setPost={setPost}
              imgUrls={imgUrls}
              setImgUrls={setImgUrls}
              gifUrl={gifUrl}
              setGifUrl={setGifUrl}
              isPickerShown={isPickerShown}
              poll={poll}
              setPoll={setPoll}
              schedule={schedule}
              setSchedule={setSchedule}
            />
            <div className="secondary-action-container">
              {post.text.length > 0 && (
                <div className="indicator-thread-btn-container">
                  <TextIndicator textLength={post.text.length} />
                  <hr className="vertical" />
                  <button className="btn-add-thread">
                    <AiOutlinePlus className="btn-add-thread-icon" />
                  </button>
                </div>
              )}
              <BtnCreatePost
                isLinkToNestedPage={false}
                isValid={0 < post.text.length && post.text.length <= 247}
                onAddPost={onAddPost}
              />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};
