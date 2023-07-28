import { FC } from "react";
import "./Footer.scss";

type FooterProps = {
  children: React.ReactNode;
};

export const Footer: FC<FooterProps> = ({ children }) => {
  return <footer>{children}</footer>;
};
