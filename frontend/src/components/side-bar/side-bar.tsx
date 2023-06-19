import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { BtnCreatePost } from "../btns/btn-create-post";
import { Logo } from "../other/logo";
import { UserPreview } from "../user/user-preview";
import { NavList } from "./nav-list";
import { useState } from "react";
import { SideBarOptionsModal } from "../modals/side-bar-options-modal";

export const SideBar = () => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="side-bar">
      <div className="main-container">
        <Logo />
        <NavList />
        <BtnCreatePost isSideBarBtn={true} isDisabled={false} />
      </div>
      {loggedinUser && (
        <div className="user-preview-container">
          <UserPreview user={loggedinUser} isEllipsisShown={true} onClickFunc={toggleModal} />
          {isModalOpen && (
            <SideBarOptionsModal loggedinUser={loggedinUser} toggleModal={toggleModal} />
          )}
        </div>
      )}
    </div>
  );
};
