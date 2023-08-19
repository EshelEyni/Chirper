/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useState, createContext, useContext, cloneElement } from "react";
import { createPortal } from "react-dom";
import { MainScreen } from "../../App/MainScreen/MainScreen";
import "./Modal.scss";
import { useOutsideClick } from "../../../hooks/app/useOutsideClick";

type ModalProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  externalStateControl?: {
    externalOpenedModalName: string;
    setExternalOpenedModalName: React.Dispatch<React.SetStateAction<string>>;
  };
};

type OpenBtnProps = {
  children: React.ReactElement;
  modalName: string;
};

type CloseBtnProps = {
  children: React.ReactElement;
  onClickFn?: () => void;
};

type WindowProps = {
  children: React.ReactElement[];
  name: string;
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
} = ({ children, externalStateControl }) => {
  const [internalOpenedModalName, internalSetOpenedModalName] = useState("");

  const close = () => {
    if (externalStateControl) {
      externalStateControl.setExternalOpenedModalName("");
      return;
    }
    internalSetOpenedModalName("");
  };
  const open = (name: string) => {
    if (externalStateControl) {
      externalStateControl.setExternalOpenedModalName(name);
      return;
    }
    internalSetOpenedModalName(name);
  };

  const openedModalName = externalStateControl?.externalOpenedModalName || internalOpenedModalName;

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

const CloseBtn: FC<CloseBtnProps> = ({ children, onClickFn }) => {
  const { close } = useContext(ModalContext)!;
  return cloneElement(children, {
    onClick: () => {
      onClickFn?.();
      close();
    },
  });
};

const Window: FC<WindowProps> = ({
  children,
  name,
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
        className={`modal ${name}`}
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
