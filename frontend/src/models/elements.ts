import { ReactElement } from "react";
import { IconType } from "react-icons";

export interface NavLink {
    path: string;
    title: string;
    iconActive: ReactElement;
    iconUnActive: ReactElement;
}