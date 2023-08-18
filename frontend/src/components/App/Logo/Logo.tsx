import { Link } from "react-router-dom";
import { AiOutlineTwitter } from "react-icons/ai";
import "./Logo.scss";

type LogoProps = {
  options?: {
    staticLogo: boolean;
    autoAnimate: boolean;
    height: number;
    width: number;
  };
};

export const Logo = ({ options }: LogoProps) => {
  const style = options
    ? {
        height: `${options.height}px`,
        width: `${options.width}px`,
        fontSize: `${options.height * 0.33}px`,
      }
    : undefined;
  return (
    <Link
      className={`logo-container ${options?.autoAnimate ? "auto-animation" : ""}`}
      to="/"
      style={style}
    >
      {options?.staticLogo ? (
        <div className="logo">
          <AiOutlineTwitter size={options.height * 0.65} color="white" />
        </div>
      ) : (
        <div className="logo-wrapper">
          <div className="bird">
            <div className="body"></div>
            <div className="body-top-cut-left"></div>
            <div className="tail-cut"></div>
            <div className="feather-bottom"></div>
            <div className="feather-bottom-cut"></div>
            <div className="feather-middle"></div>
            <div className="feather-middle-cut"></div>
            <div className="feather-top"></div>
            <div className="body-top-cut-right"></div>
            <div className="mouth-bottom"></div>
            <div className="mouth-bottom-cut"></div>
            <div className="mouth-top"></div>
            <div className="mouth-top-cut"></div>
            <div className="head"></div>
          </div>
          <div className="muzieknootjes">
            <div className="noot-1">&#9835; &#9833;</div>
            <div className="noot-2">&#9833;</div>
            <div className="noot-3">&#9839; &#9834;</div>
            <div className="noot-4">&#9834;</div>
          </div>
        </div>
      )}
    </Link>
  );
};
