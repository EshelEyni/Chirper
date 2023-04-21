import { ReactElement, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AudiencePickerModal } from "../modals/audience-picker-modal";
import { RepliersPickerModal } from "../modals/repliers-picker-modal";
import { IoChevronDownOutline } from "react-icons/io5";
import { FaGlobeAmericas } from "react-icons/fa";
import { BtnCreatePost } from "../btns/btn-create-post";
import { PostEditActionBtns } from "../btns/post-edit-action-btns";
import { TextIndicator } from "../other/text-indicator";
import { AiOutlinePlus } from "react-icons/ai";
import { BsBorderAll } from "react-icons/bs";

interface PostEditProps {
  isHomePage?: boolean;
}

interface repliersElements {
  title: string;
  icon: ReactElement;
}

export const PostEdit: React.FC<PostEditProps> = ({ isHomePage = false }) => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const [audience, setAudience] = useState<string>("everyone");
  const [isAudienceOpen, setIsAudienceOpen] = useState<boolean>(true);
  const [whoCanReply, setWhoCanReply] = useState<repliersElements>({
    title: "Everyone",
    icon: <FaGlobeAmericas />,
  });
  const [isRepliersOpen, setIsRepliersOpen] = useState<boolean>(false);
  const [isPickerShown, setIsPickerShown] = useState<boolean>(!isHomePage);
  const [text, setText] = useState<string>("");

  const toggleModal = (type: string) => {
    if (type === "audience") setIsAudienceOpen(!isAudienceOpen);
    if (type === "repliers") setIsRepliersOpen(!isRepliersOpen);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <section className="post-edit">
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
                <span>{audience}</span>
                <IoChevronDownOutline />
              </button>
              {isAudienceOpen && (
                <AudiencePickerModal
                  audience={audience}
                  setAudience={setAudience}
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
            onClick={() => {
              if (isHomePage) setIsPickerShown(true);
            }}
          />
          {isPickerShown && (
            <button
              className="btn-toggle-repliers"
              onClick={() => toggleModal("repliers")}
            >
              {whoCanReply.icon}
              <span>{whoCanReply.title}</span>
              can reply
            </button>
          )}
          {isRepliersOpen && <RepliersPickerModal />}
          <div
            className={"btns-container" + (isPickerShown ? " border-show" : "")}
          >
            <PostEditActionBtns />
            <div className="secondary-action-container">
              {text.length > 0 && (
                <div className="indicator-thread-btn-container">
                  <TextIndicator textLength={text.length} />
                  <hr className="vertical" />
                  <button className="btn-add-thread">
                    <AiOutlinePlus
                      style={{
                        color: "var(--color-primary)",
                        height: "16px",
                        width: "16px",
                      }}
                    />
                  </button>
                </div>
              )}
              <BtnCreatePost
                isLinkToNestedPage={false}
                isValid={0 < text.length && text.length <= 247}
              />
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};
