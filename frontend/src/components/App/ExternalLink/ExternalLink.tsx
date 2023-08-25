import { FC } from "react";
import "./ExternalLink.scss";

type ExternalLinkProps = {
  children: React.ReactNode;
  link: string;
};

export const ExternalLink: FC<ExternalLinkProps> = ({ children, link }) => {
  return (
    <a className="external-link" href={link} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};
