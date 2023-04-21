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
import { BsBell, BsFillBellFill } from "react-icons/bs";
import { NavLink as NavLinkType } from "../../types/elements.interface";
import { NavLink } from "react-router-dom";

export const NavList = () => {
  const links: NavLinkType[] = [
    {
      path: "/",
      title: "Home",
      iconActive: <AiFillHome className="active-icon" />,
      iconUnActive: <AiOutlineHome className="unactive-icon" />,
    },
    {
      path: "/explore",
      title: "Explore",
      iconActive: <FaHashtag className="active-icon" />,
      iconUnActive: <CiHashtag className="unactive-icon" />,
    },
    {
      path: "/notifications",
      title: "Notifications",
      iconActive: <BsFillBellFill className="active-icon" />,
      iconUnActive: <BsBell className="unactive-icon" />,
    },
    {
      path: "/messages",
      title: "Messages",
      iconActive: <FaEnvelope className="active-icon" />,
      iconUnActive: <FaRegEnvelope className="unactive-icon" />,
    },
    {
      path: "/bookmarks",
      title: "Bookmarks",
      iconActive: <FaBookmark className="active-icon" />,
      iconUnActive: <FaRegBookmark className="unactive-icon" />,
    },
    {
      path: "/profile",
      title: "Profile",
      iconActive: <FaUser className="active-icon" />,
      iconUnActive: <FaRegUser className="unactive-icon" />,
    },
  ];

  return (
    <ul className="nav-list">
      {links.map((link, index) => (
        <li key={index}>
          <div className="link-container">
            <NavLink to={link.path}>
              {link.iconActive}
              {link.iconUnActive}
              <span>{link.title}</span>
            </NavLink>
          </div>
        </li>
      ))}
    </ul>
  );
};
