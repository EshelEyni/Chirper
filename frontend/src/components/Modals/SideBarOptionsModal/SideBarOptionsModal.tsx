import { GoTriangleDown } from "react-icons/go";
import { IoIosBrush } from "react-icons/io";
import { User } from "../../../../../shared/interfaces/user.interface";
import { ReactComponent as ChirperCircleIcon } from "../../../assets/svg/chirper-circle-outline.svg";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { GiFeather } from "react-icons/gi";
import { FaAt } from "react-icons/fa";
import "./SideBarOptionsModal.scss";
import { Modal } from "../Modal/Modal";
import { userLogout } from "../../../store/slices/authSlice";

interface SideBarOptionsModalProps {
  loggedInUser: User;
  toggleModal: () => void;
}

export const SideBarOptionsModal: FC<SideBarOptionsModalProps> = ({
  loggedInUser,
  toggleModal,
}) => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const handleLinkClick = (path: string) => {
    toggleModal();
    navigate(path, { relative: "path" });
  };

  const onLogout = async () => {
    await dispatch(userLogout());
    toggleModal();
    navigate("/explore");
  };

  const btns = [
    {
      icon: <FaAt className="icon" />,
      title: "Connect",
      // eslint-disable-next-line no-console
      onClick: () => console.log("connect"),
    },
    {
      icon: <GiFeather className="icon" />,
      title: "Drafts",
      // eslint-disable-next-line no-console
      onClick: () => console.log("drafts"),
    },
    {
      icon: <ChirperCircleIcon className="icon" />,
      title: "Chirper Circle",
      onClick: () => handleLinkClick("chirper-circle"),
    },
    {
      icon: <IoIosBrush className="icon display" />,
      title: "Display",
      onClick: () => handleLinkClick("display"),
    },
    {
      title: `Logout @${loggedInUser.username}`,
      onClick: onLogout,
    },
  ];

  return (
    <Modal className="side-bar-options" onClickMainScreen={toggleModal}>
      {btns.map(btn => (
        <button key={btn.title} className="side-bar-options-btn" onClick={btn.onClick}>
          {btn.icon} <span>{btn.title}</span>
        </button>
      ))}
      <GoTriangleDown className="side-bar-options-arrow" />
    </Modal>
  );
};
