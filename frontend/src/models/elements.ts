import { ReactElement } from "react";

export interface NavLink {
    path: string;
    title: string;
    iconActive: ReactElement;
    iconUnActive: ReactElement;
}