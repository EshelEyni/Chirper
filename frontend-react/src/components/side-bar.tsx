import { NavLink } from "react-router-dom";

export const SideBar = () => {

    const links: { name: string, url: string }[] = [
        { name: "Home", url: "/" },
        { name: "Explore", url: "/explore" },
        { name: "Notifications", url: "/notifications" },
        { name: "Messages", url: "/messages" },
        { name: "Bookmarks", url: "/bookmarks" },
        { name: "Profile", url: "/profile" },
    ];

    return (
        <div>
            <h1>SideBar</h1>
            <ul>
                {links.map((link) => (
                    <li key={link.name}>
                        <NavLink to={link.url}>{link.name}</NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};