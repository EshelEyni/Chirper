import { FC } from "react";
import { Logo } from "../../App/Logo/Logo";
import { SpinnerLoader } from "../SpinnerLoader/SpinnerLoader";
import "./PageLoader.scss";

type PageLoaderProps = {
  isBirdLoader?: boolean;
};

export const PageLoader: FC<PageLoaderProps> = ({ isBirdLoader = false }) => {
  return (
    <div className="page-loader">
      {isBirdLoader ? (
        <>
          <span className="progress-bar" />
          <Logo options={{ autoAnimate: true, height: 400, width: 400 }} />
        </>
      ) : (
        <SpinnerLoader />
      )}
    </div>
  );
};
