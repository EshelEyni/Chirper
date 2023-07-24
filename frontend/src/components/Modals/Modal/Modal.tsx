import { FC } from "react";
import "./Modal.scss";
import { MainScreen } from "../../App/MainScreen/MainScreen";

type ModalProps = {
  children: React.ReactNode;
  onClickMainScreen: () => void;
};

export const Modal: FC<ModalProps> = ({ children, onClickMainScreen }) => {
  return (
    <>
      <MainScreen onClickFn={onClickMainScreen} />
      <section className="modal">{children}</section>
    </>
  );
};
