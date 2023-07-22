import { Logo } from "../../App/Logo/Logo";
import "./PageLoader.scss";

export const PageLoader = () => {
  return (
    <div className="page-loader">
      <span className="progress-bar" />
      <Logo options={{ autoAnimate: true, height: 450, width: 450 }} />
    </div>
  );
};
