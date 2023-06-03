import { AiOutlineHome, AiFillHome } from "react-icons/ai";
import { CiHashtag } from "react-icons/ci";
import {
  FaHashtag,
  FaRegEnvelope,
  FaEnvelope,
  FaRegBookmark,
  FaBookmark,
  FaRegUser,
  FaUser,
} from "react-icons/fa";
import { MdListAlt } from "react-icons/md";
import { IoMdListBox } from "react-icons/io";
import { BsBell, BsFillBellFill } from "react-icons/bs";
import { NavLink as NavLinkType } from "../../types/elements.interface";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export const NavList = () => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);

  const links: NavLinkType[] = [
    {
      path: "/",
      title: "Home",
      iconActive: <AiFillHome className="active-icon" />,
      iconUnActive: <AiOutlineHome className="unactive-icon" />,
      isShown: !!loggedinUser,
    },
    {
      path: "/explore",
      title: "Explore",
      iconActive: <FaHashtag className="active-icon" />,
      iconUnActive: <CiHashtag className="unactive-icon" />,
      isShown: true,
    },
    {
      path: "/notifications",
      title: "Notifications",
      iconActive: <BsFillBellFill className="active-icon" />,
      iconUnActive: <BsBell className="unactive-icon" />,
      isShown: !!loggedinUser,
    },
    {
      path: "/messages",
      title: "Messages",
      iconActive: <FaEnvelope className="active-icon" />,
      iconUnActive: <FaRegEnvelope className="unactive-icon" />,
      isShown: !!loggedinUser,
    },
    {
      path: "/lists",
      title: "Lists",
      iconActive: <IoMdListBox className="active-icon" />,
      iconUnActive: <MdListAlt className="unactive-icon" />,
      isShown: !!loggedinUser,
    },
    {
      path: "/bookmarks",
      title: "Bookmarks",
      iconActive: <FaBookmark className="active-icon" />,
      iconUnActive: <FaRegBookmark className="unactive-icon" />,
      isShown: !!loggedinUser,
    },
    {
      path: `/profile/${loggedinUser?.id}`,
      title: "Profile",
      iconActive: <FaUser className="active-icon" />,
      iconUnActive: <FaRegUser className="unactive-icon" />,
      isShown: !!loggedinUser,
    },
  ];

  return (
    <ul className="nav-list">
      {links.map((link, index) => {
        if (link.isShown) {
          return (
            <li key={index}>
              <div className="link-container">
                <NavLink to={link.path}>
                  {link.iconActive}
                  {link.iconUnActive}
                  <span>{link.title}</span>
                </NavLink>
              </div>
            </li>
          );
        }
      })}
    </ul>
  );
};
