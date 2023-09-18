import { useNavigate } from "react-router-dom";
import { AiOutlineTwitter } from "react-icons/ai";
import "./Logo.scss";

type StaticLogoProps = {
  staticLogo: true;
  autoAnimate?: boolean;
  linkEnabled?: boolean;
  size: {
    height: number;
    width: number;
  };
};

type DynamicLogoProps = {
  staticLogo?: false;
  autoAnimate?: boolean;
  linkEnabled?: boolean;
  size?: {
    height: number;
    width: number;
  };
};

type LogoProps = StaticLogoProps | DynamicLogoProps;

export const Logo = (
  { staticLogo, autoAnimate, linkEnabled, size }: LogoProps = {
    staticLogo: false,
    autoAnimate: false,
    linkEnabled: false,
    size: undefined,
  }
) => {
  const navigate = useNavigate();

  const style = size
    ? {
        height: `${size.height}px`,
        width: `${size.width}px`,
        fontSize: `${size.height * 0.33}px`,
      }
    : undefined;

  function handleLogoClick() {
    if (!linkEnabled) return;
    navigate("/");
  }

  return (
    <section
      className={`logo-container ${autoAnimate ? "auto-animation" : ""}`}
      style={style}
      onClick={handleLogoClick}
    >
      {staticLogo ? (
        <div className="logo" data-testid="static-logo">
          <AiOutlineTwitter size={size.height * 0.65} color="white" />
        </div>
      ) : (
        <div className="logo-wrapper" data-testid="logo">
          <div className="bird" data-testid="bird">
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
    </section>
  );
};
