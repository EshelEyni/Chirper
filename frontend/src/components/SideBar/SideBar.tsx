import { useDispatch, useSelector } from "react-redux";
import { Logo } from "../App/Logo/Logo";
import { NavList } from "./NavList/NavList";
import { UserPreview } from "../User/UserPreview/UserPreview";
import { User } from "../../../../shared/types/user";
import { useNavigate } from "react-router-dom";
import { userLogout } from "../../store/slices/authSlice";
import { FaAt } from "react-icons/fa";
import { GiFeather } from "react-icons/gi";
import { ReactComponent as ChirperCircleIcon } from "../../assets/svg/chirper-circle-outline.svg";
import "./SideBar.scss";
import { IoIosBrush } from "react-icons/io";
import { Modal } from "../Modal/Modal";
import { AppDispatch, RootState } from "../../types/app";
import { Button } from "../App/Button/Button";
import { NewPostType, setNewPostType } from "../../store/slices/postEditSlice";

export const SideBar = () => {
  const { loggedInUser } = useSelector((state: RootState) => state.auth);

  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();

  function handleLinkClick(path: string) {
    navigate(path, { relative: "path" });
  }

  async function onLogout() {
    await dispatch(userLogout());
    navigate("/explore");
  }

  function handleBtnClick() {
    dispatch(setNewPostType(NewPostType.SideBar));
    navigate("compose", { relative: "path" });
  }

  const btns = [
    {
      icon: <FaAt className="icon" />,
      title: "Connect",
      onClick: () => console.log("connect"),
    },
    {
      icon: <GiFeather className="icon" />,
      title: "Drafts",
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
      title: `Logout @${loggedInUser?.username}`,
      onClick: onLogout,
    },
  ];

  return (
    <div className="side-bar">
      <div className="main-container">
        <Logo />
        <NavList />
        <Button className="btn-create-post" onClickFn={handleBtnClick}>
          Chirp
        </Button>
      </div>
      {loggedInUser && (
        <Modal>
          <Modal.OpenBtn modalName="side-bar-options" setPositionByRef={true} modalHeight={400}>
            <div className="user-preview-container">
              <UserPreview user={loggedInUser as User} isEllipsisShown={true} />
            </div>
          </Modal.OpenBtn>

          <Modal.Window name="side-bar-options" style={{ transform: "translate(-35%, 10%)" }}>
            {btns.map(btn => (
              <Modal.CloseBtn key={btn.title} onClickFn={btn.onClick}>
                <button key={btn.title} className="side-bar-options-btn">
                  {btn.icon} <span>{btn.title}</span>
                </button>
              </Modal.CloseBtn>
            ))}
          </Modal.Window>
        </Modal>
      )}
    </div>
  );
};
