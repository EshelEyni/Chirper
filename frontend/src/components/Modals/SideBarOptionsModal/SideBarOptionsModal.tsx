import { GoTriangleDown } from "react-icons/go";
import { IoIosBrush } from "react-icons/io";
import { User } from "../../../../../shared/interfaces/user.interface";
import { ReactComponent as ChirperCircleIcon } from "../../../assets/svg/chirper-circle-outline.svg";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { logout } from "../../../store/actions/auth.actions";
import { GiFeather } from "react-icons/gi";
import { FaAt } from "react-icons/fa";
import "./SideBarOptionsModal.scss";

interface SideBarOptionsModalProps {
  loggedinUser: User;
  toggleModal: () => void;
}

export const SideBarOptionsModal: FC<SideBarOptionsModalProps> = ({
  loggedinUser,
  toggleModal,
}) => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  const navigateTo = (path: string) => {
    toggleModal();
    navigate(path);
  };

  const onLogout = async () => {
    await dispatch(logout());
    toggleModal();
    navigate("/explore");
  };

  const btns = [
    {
      icon: <FaAt className="icon" />,
      text: "Connect",
      onClick: () => console.log("connect"),
    },
    {
      icon: <GiFeather className="icon" />,
      text: "Drafts",
      onClick: () => console.log("drafts"),
    },
    {
      icon: <ChirperCircleIcon className="icon" />,
      text: "Chirper Circle",
      onClick: () => navigateTo("/chirper-circle"),
    },
    {
      icon: <IoIosBrush className="icon display" />,
      text: "Display",
      onClick: () => navigateTo("/display"),
    },
    {
      text: `Logout @${loggedinUser.username}`,
      onClick: onLogout,
    },
  ];

  return (
    <>
      <section className="side-bar-options-modal">
        {btns.map((btn, index) => (
          <button key={index} className="side-bar-options-modal-btn" onClick={btn.onClick}>
            {btn.icon}
            <span>{btn.text}</span>
          </button>
        ))}

        <GoTriangleDown className="side-bar-options-modal-arrow" />
      </section>
      <div className="main-screen" onClick={toggleModal} />
    </>
  );
};
