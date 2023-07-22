import { AiOutlineHome, AiFillHome } from "react-icons/ai";
import { CiHashtag } from "react-icons/ci";
import { FaHashtag, FaRegBookmark, FaBookmark, FaRegUser, FaUser } from "react-icons/fa";
import { NavLink as NavLinkType } from "../../../types/elements.interface";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import "./NavList.scss";

export const NavList = () => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);

  const links: NavLinkType[] = [
    {
      path: "/home",
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
      path: "/bookmarks",
      title: "Bookmarks",
      iconActive: <FaBookmark className="active-icon" />,
      iconUnActive: <FaRegBookmark className="unactive-icon" />,
      isShown: !!loggedinUser,
    },
    {
      path: `/profile/${loggedinUser?.username}`,
      title: "Profile",
      iconActive: <FaUser className="active-icon" />,
      iconUnActive: <FaRegUser className="unactive-icon" />,
      isShown: !!loggedinUser,
    },
  ];

  return (
    <section className="nav-list">
      {links.map((link, index) => {
        if (link.isShown) {
          return (
            <NavLink to={link.path} key={index}>
              {link.iconActive}
              {link.iconUnActive}
              <span>{link.title}</span>
            </NavLink>
          );
        }
      })}
    </section>
  );
};
