import { ReactElement, useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AudiencePickerModal } from "../modals/audience-picker-modal";
import { RepliersPickerModal } from "../modals/repliers-picker-modal";
import { IoChevronDownOutline } from "react-icons/io5";
import { FaGlobeAmericas } from "react-icons/fa";
import { BtnCreatePost } from "../btns/btn-create-post";
import { PostEditActionBtns } from "../btns/post-edit-action-btns";
import { TextIndicator } from "../other/text-indicator";
import { AiOutlinePlus } from "react-icons/ai";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../store/types";
import { addPost } from "../../store/actions/post.actions";
import { PostEditImg } from "./post-edit-img-container";
import { GifUrl } from "../../../../shared/interfaces/gif.interface";
import { Gif } from "../gif/gif";

interface PostEditProps {
  isHomePage?: boolean;
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

export const PostEdit: React.FC<PostEditProps> = ({ isHomePage = false }) => {
  const dispatch: AppDispatch = useDispatch();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);

  const [audienceSetting, setAudienceSetting] = useState<audienceSettings>({
    title: "Everyone",
    value: "everyone",
  });
  const [isAudienceOpen, setIsAudienceOpen] = useState<boolean>(false);
  const [replierSetting, setReplierSetting] = useState<repliersSetting>({
    title: "Everyone",
    icon: <FaGlobeAmericas />,
    value: "everyone",
  });
  const [isRepliersOpen, setIsRepliersOpen] = useState<boolean>(false);
  const [isPickerShown, setIsPickerShown] = useState<boolean>(!isHomePage);
  const [text, setText] = useState<string>("");
  const [imgUrls, setImgUrls] = useState<{ url: string; isLoading: boolean }[]>(
    [
      // "https://res.cloudinary.com/dng9sfzqt/image/upload/v1675072753/wxgggjhzxdbuntjb9agg.jpg",
      // "https://res.cloudinary.com/dng9sfzqt/image/upload/v1675069390/dixq40dcbhqomxet64x2.png",
      // "https://res.cloudinary.com/dng9sfzqt/image/upload/v1674947349/iygilawrooz36soschcq.png",
    ]
  );

  const [gifUrl, setGifUrl] = useState<GifUrl | null>({
    url: "https://media0.giphy.com/media/l4Ep3mmmj7Bw3adWw/giphy.gif?cid=40d87703jz0fdl3tagat206yqf1y9zbxs9jtul6ea0iq0o02&ep=v1_gifs_search&rid=giphy.gif&ct=g",
    staticUrl: "https://media0.giphy.com/media/l4Ep3mmmj7Bw3adWw/giphy_s.gif?cid=40d87703jz0fdl3tagat206yqf1y9zbxs9jtul6ea0iq0o02&ep=v1_gifs_search&rid=giphy_s.gif&ct=g"
});

  const toggleModal = (type: string) => {
    if (type === "audience") setIsAudienceOpen(!isAudienceOpen);
    if (type === "repliers") setIsRepliersOpen(!isRepliersOpen);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const onAddPost = async () => {
    if (!loggedinUser) return;
    const post: NewPost = {
      text,
      audience: audienceSetting.value,
      repliersType: replierSetting.title,
      imgUrls: imgUrls.map((img) => img.url),
      user: {
        _id: loggedinUser._id,
        username: loggedinUser.username,
        fullname: loggedinUser.fullname,
        imgUrl: loggedinUser.imgUrl,
      },
    };
    await dispatch(addPost(post));
    setText("");
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
      {!isHomePage && (
        <div className="btn-container">
          <button className="btn-close">
            <IoClose />
          </button>
        </div>
      )}

      <div className="content-container">
        <div>
          <img
            className="post-edit-user-img"
            src={loggedinUser?.imgUrl}
            alt="profile-img"
          />
        </div>

        <main
          className={
            "main-content" + (isHomePage && !isPickerShown ? " gap-0" : "")
          }
        >
          {isPickerShown && (
            <div className="post-edit-header">
              <button
                className="btn-toggle-audience"
                onClick={() => toggleModal("audience")}
              >
                <span>{audienceSetting.title}</span>
                <IoChevronDownOutline />
              </button>
              {isAudienceOpen && (
                <AudiencePickerModal
                  audience={audienceSetting}
                  setAudience={setAudienceSetting}
                  toggleModal={toggleModal}
                />
              )}
            </div>
          )}
          <textarea
            className={
              "post-edit-text-area" +
              (isHomePage ? " home-page-height" : "") +
              (isHomePage && !isPickerShown ? " pt-10" : "")
            }
            placeholder="What's happening?"
            value={text}
            onChange={handleTextChange}
            ref={textAreaRef}
          />
          {imgUrls.length > 0 && (
            <PostEditImg imgUrls={imgUrls} setImgUrls={setImgUrls} />
          )}

          {gifUrl && (
            <Gif
              gifUrl={gifUrl}
              setGifUrl={setGifUrl}
            />
          )}

          {isPickerShown && (
            <div className="btn-toggle-repliers-container">
              <button
                className="btn-toggle-repliers"
                onClick={() => toggleModal("repliers")}
              >
                {replierSetting.icon}
                <span>{replierSetting.title}</span>
                can reply
              </button>
              {isRepliersOpen && (
                <RepliersPickerModal
                  replierSetting={replierSetting}
                  setReplierSetting={setReplierSetting}
                  toggleModal={toggleModal}
                />
              )}
            </div>
          )}
          <div
            className={"btns-container" + (isPickerShown ? " border-show" : "")}
          >
            <PostEditActionBtns
              imgUrls={imgUrls}
              setImgUrls={setImgUrls}
              gifUrl={gifUrl}
              setGifUrl={setGifUrl}
              isPickerShown={isPickerShown}
            />
            <div className="secondary-action-container">
              {text.length > 0 && (
                <div className="indicator-thread-btn-container">
                  <TextIndicator textLength={text.length} />
                  <hr className="vertical" />
                  <button className="btn-add-thread">
                    <AiOutlinePlus className="btn-add-thread-icon" />
                  </button>
                </div>
              )}
              <BtnCreatePost
                isLinkToNestedPage={false}
                isValid={0 < text.length && text.length <= 247}
                onAddPost={onAddPost}
              />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};
