import { useNavigate } from "react-router-dom";
import "./BtnLink.scss";

type BtnLinkProps = {
  path: string;
  title: string;
};

export const BtnLink = ({ path, title }: BtnLinkProps) => {
  const navigate = useNavigate();

  function onGoToLink() {
    navigate(path);
  }
  return (
    <button className="btn-link" onClick={onGoToLink}>
      {title}
    </button>
  );
};
