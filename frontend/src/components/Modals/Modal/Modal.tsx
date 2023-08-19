import { FC, useState, createContext, useContext, cloneElement } from "react";
import { createPortal } from "react-dom";
import { MainScreen } from "../../App/MainScreen/MainScreen";
import "./Modal.scss";
import { useOutsideClick } from "../../../hooks/app/useOutsideClick";

type ModalProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

type OpenBtnProps = {
  children: React.ReactElement;
  modalName: string;
};

type CloseBtnProps = {
  children: React.ReactElement;
};

type WindowProps = {
  children: React.ReactElement[];
  name: string;
  className: string;
  mainScreenMode: "dark" | "light";
  mainScreenZIndex: number;
  elementId: string;
};

type ModalContextType = {
  openedModalName: string;
  close: () => void;
  open: (name: string) => void;
};

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const Modal: FC<ModalProps> & {
  OpenBtn: FC<OpenBtnProps>;
  Window: FC<WindowProps>;
  CloseBtn: FC<CloseBtnProps>;
} = ({ children }) => {
  const [openedModalName, setOpenedModalName] = useState("");

  const close = () => setOpenedModalName("");
  const open = (name: string) => setOpenedModalName(name);

  return (
    <ModalContext.Provider value={{ openedModalName, close, open }}>
      {children}
    </ModalContext.Provider>
  );
};

const OpenBtn: FC<OpenBtnProps> = ({ children, modalName }) => {
  const { open } = useContext(ModalContext)!;
  return cloneElement(children, {
    onClick: () => open(modalName),
  });
};

const CloseBtn: FC<CloseBtnProps> = ({ children }) => {
  const { close } = useContext(ModalContext)!;
  return cloneElement(children, {
    onClick: close,
  });
};

const Window: FC<WindowProps> = ({
  children,
  name,
  className,
  mainScreenMode,
  mainScreenZIndex,
  elementId,
}) => {
  const { openedModalName, close } = useContext(ModalContext)!;
  const { outsideClickRef } = useOutsideClick<HTMLElement>(close);

  if (name !== openedModalName) return null;

  return createPortal(
    <>
      <MainScreen mode={mainScreenMode} zIndex={mainScreenZIndex} />
      <section
        className={`modal ${className}`}
        style={{ zIndex: mainScreenZIndex + 1 }}
        ref={outsideClickRef}
      >
        {children}
      </section>
    </>,
    document.getElementById(elementId)!
  );
};

Modal.OpenBtn = OpenBtn;
Modal.Window = Window;
Modal.CloseBtn = CloseBtn;
