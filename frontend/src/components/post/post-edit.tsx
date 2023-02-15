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
interface PostEditProps {}

interface repliersElements {
  title: string;
  icon: ReactElement;
}

export const PostEdit = () => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const [audience, setAudience] = useState<string>("everyone");
  const [isAudienceOpen, setIsAudienceOpen] = useState<boolean>(false);
  const [whoCanReply, setWhoCanReply] = useState<repliersElements>({
    title: "Everyone",
    icon: <FaGlobeAmericas />,
  });
  const [isRepliersOpen, setIsRepliersOpen] = useState<boolean>(false);

  const toggleModal = (type: string) => {
    if (type === "audience") setIsAudienceOpen(!isAudienceOpen);
    if (type === "repliers") setIsRepliersOpen(!isRepliersOpen);
  };

  return (
    <section className="post-edit">
      <div className="btn-container">
        <button className="btn-close">
          <IoClose />
        </button>
      </div>

      <div className="content-container">
        <img
          className="post-edit-user-img"
          src={loggedinUser?.imgUrl}
          alt="profile-img"
        />
        <main className="main-content">
          <div className="post-edit-header">
            <button
              className="btn-toggle-audience"
              onClick={() => toggleModal("audience")}
            >
              <span>{audience}</span>
              <IoChevronDownOutline />
            </button>
            {isAudienceOpen && <AudiencePickerModal />}
          </div>
          <textarea
            className="post-edit-text-area"
            placeholder="What's happening?"
          />
          <button
            className="btn-toggle-repliers"
            onClick={() => toggleModal("repliers")}
          >
            {whoCanReply.icon}
            <span>{whoCanReply.title}</span>
            can reply
          </button>
          {isRepliersOpen && <RepliersPickerModal />}
          <div className="btns-container">
            <PostEditActionBtns/>
            <BtnCreatePost isLinkToNestedPage={false}/>
          </div>
        </main>
      </div>
    </section>
  );
};
