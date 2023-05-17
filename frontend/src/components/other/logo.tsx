import { Link } from "react-router-dom";
import { ReactComponent as LogoImg } from "../../assets/svg/logo.svg";

export const Logo = () => {
  return (
    <Link className="logo-container" to="/">
      <LogoImg className="logo" />
    </Link>
  );
};
