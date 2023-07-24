import { FC } from "react";
import { MainScreen } from "../../App/MainScreen/MainScreen";
import "./Modal.scss";

type ModalProps = {
  children: React.ReactNode;
  className: string;
  style?: React.CSSProperties;
  onClickMainScreen: () => void;
  mainScreenMode?: "dark" | "light";
  mainScreenZIndex?: number;
};

export const Modal: FC<ModalProps> = ({
  children,
  className,
  style,
  onClickMainScreen,
  mainScreenMode,
  mainScreenZIndex,
}) => {
  return (
    <>
      <MainScreen onClickFn={onClickMainScreen} mode={mainScreenMode} zIndex={mainScreenZIndex} />
      <section className={`modal ${className}`} style={style}>
        {children}
      </section>
    </>
  );
};
