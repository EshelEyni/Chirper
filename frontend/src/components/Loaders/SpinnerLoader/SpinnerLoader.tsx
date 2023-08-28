import { FC } from "react";
import "./SpinnerLoader.scss";

type SpinnerLoaderProps = {
  withContainer?: boolean;
  containerSize?: {
    width?: string;
    height?: string;
  };
};

export const SpinnerLoader: FC<SpinnerLoaderProps> = ({ withContainer, containerSize }) => {
  if (withContainer && containerSize)
    return (
      <div
        className="spinner-loader-container"
        style={{
          width: containerSize.width || "100%",
          height: containerSize.height || "100%",
        }}
      >
        <div className="spinner-loader" />
      </div>
    );

  return <div className="spinner-loader" />;
};
