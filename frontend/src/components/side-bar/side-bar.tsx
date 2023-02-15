import { BtnCreatePost } from "../btns/btn-create-post";
import { Logo } from "../other/logo";
import { UserPreview } from "../user/user-preview";
import { NavList } from "./nav-list";

export const SideBar = () => {

  return (
    <div className="side-bar">
      <div className="main-container">
        <Logo />
        <NavList />
        <BtnCreatePost isLinkToNestedPage={true} />
      </div>
      <UserPreview />
    </div>
  );
};
