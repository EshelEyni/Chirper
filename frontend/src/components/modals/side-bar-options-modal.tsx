import { RiUserHeartFill } from "react-icons/ri";
import { GoGraph, GoTriangleDown } from "react-icons/go";
import { IoIosBrush } from "react-icons/io";
import { authService } from "../../services/auth.service";
import { MiniUser } from "../../../../shared/interfaces/user.interface";
import {ReactComponent as ChirperCircleIcon} from "../../assets/svg/chirper-circle-outline.svg";
import React from "react";
import { useNavigate } from "react-router-dom";

interface SideBarOptionsModalProps {
  loggedinUser: MiniUser;
  toggleModal: () => void;
}

export const SideBarOptionsModal: React.FC<SideBarOptionsModalProps> = ({
  loggedinUser,
  toggleModal,
}) => {
  const navigate = useNavigate();

  const navigateTo = (path: string) => {
    toggleModal();
    if (path === "/analytics") {
      window.open(path, "_blank");
      return;   
    }
    navigate(path);
  };

  const handleLogout = () => {
    authService.logout();
    toggleModal();
  };

  return (
    <section className="side-bar-options-modal">
      <div
        className="side-bar-options-modal-item"
        onClick={() => navigateTo("/chirper-circle")}
      >
        <ChirperCircleIcon className="icon" />
        <p>Chirper Circle</p>
      </div>
      <div
        className="side-bar-options-modal-item"
        onClick={() => navigateTo("/analytics")}
      >
        <GoGraph className="icon"/>
        <p>Analytics</p>
      </div>
      <div
        className="side-bar-options-modal-item display"
        onClick={() => navigateTo("/display")}
      >
        <IoIosBrush className="icon"/>
        <p>Display</p>
      </div>
      <button className="side-bar-options-modal-item">
        Logout @{loggedinUser.username}
      </button>

      <GoTriangleDown className="side-bar-options-modal-arrow" />
    </section>
  );
};
