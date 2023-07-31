import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Logo } from "../App/Logo/Logo";
import { NavList } from "./NavList/NavList";
import { BtnCreatePost } from "../Btns/BtnCreatePost/BtnCreatePost";
import { UserPreview } from "../User/UserPreview/UserPreview";
import { SideBarOptionsModal } from "../Modals/SideBarOptionsModal/SideBarOptionsModal";
import "./SideBar.scss";

export const SideBar = () => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  function toggleModal() {
    setIsModalOpen((prev: boolean): boolean => !prev);
  }

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
