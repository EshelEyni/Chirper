import { Logo } from "../other/logo";

export const PageLoader = () => {
  return (
    <div className="page-loader">
      <span className="progress-bar"></span>

      <Logo options={{ autoAnimate: true, height: 450, width: 450 }} />
    </div>
  );
};
