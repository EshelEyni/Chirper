/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  FC,
  useState,
  createContext,
  useContext,
  cloneElement,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { MainScreen } from "../../App/MainScreen/MainScreen";
import "./Modal.scss";
import { useOutsideClick } from "../../../hooks/app/useOutsideClick";
import { Tippy } from "../../App/Tippy/Tippy";

type ModalProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  externalStateControl?: {
    openedModalName: string;
    setOpenedModalName: React.Dispatch<React.SetStateAction<string>>;
  };
};

type OpenBtnProps = {
  children: React.ReactElement;
  modalName: string;
  setPositionByRef?: boolean;
  modalHeight?: number;
};

type CloseBtnProps = {
  children: React.ReactElement;
  onClickFn?: () => void;
};

type WindowProps = {
  children: React.ReactElement[];
  name: string;
  className?: string;
  mainScreenMode: "dark" | "light" | "transparent";
  mainScreenZIndex: number;
  elementId: string;
  includeTippy?: boolean;
};

type ModalContextType = {
  openedModalName: string;
  close: () => void;
  open: (name: string) => void;
  position: any | null;
  setPosition: React.Dispatch<React.SetStateAction<any | null>>;
  isModalAbove: boolean;
  setIsModalAbove: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const Modal: FC<ModalProps> & {
  OpenBtn: FC<OpenBtnProps>;
  Window: FC<WindowProps>;
  CloseBtn: FC<CloseBtnProps>;
} = ({ children, externalStateControl }) => {
  const [openedModalName, setOpenedModalName] = useState("");
  const [position, setPosition] = useState(null);
  const [isModalAbove, setIsModalAbove] = useState(false);

  const close = () => {
    if (externalStateControl) {
      externalStateControl.setOpenedModalName("");
      return;
    }
    setOpenedModalName("");
  };
  const open = (name: string) => {
    if (externalStateControl) {
      externalStateControl.setOpenedModalName(name);
      return;
    }
    setOpenedModalName(name);
  };

  const value = {
    openedModalName: externalStateControl?.openedModalName || openedModalName,
    close,
    open,
    position,
    setPosition,
    isModalAbove,
    setIsModalAbove,
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

const OpenBtn: FC<OpenBtnProps> = ({ children, modalName, setPositionByRef, modalHeight }) => {
  const { open, setPosition, setIsModalAbove } = useContext(ModalContext)!;
  const ref = useRef<HTMLButtonElement>(null);

  const calculatePosition = useCallback(() => {
    console.log("calculatePosition");
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || !modalHeight) return;
    const windowHeight = window.innerHeight;
    const isModalPositionUp = windowHeight - rect.top < modalHeight;
    const bottomPosition = { top: rect.bottom + rect.height / 2 + window.scrollY };
    const topPosition = { bottom: window.innerHeight - rect.top + rect.height / 2 };
    setIsModalAbove(isModalPositionUp);
    setPosition({
      ...(!isModalPositionUp ? bottomPosition : topPosition),
      left: rect.left + rect.width / 2 + window.scrollX,
    });
  }, [modalHeight, setIsModalAbove, setPosition]);

  const handleClick = () => {
    if (setPositionByRef) calculatePosition();

    open(modalName);
  };

  useEffect(() => {
    if (!setPositionByRef) return;

    const events = ["wheel", "scroll", "resize"];
    events.forEach(event => {
      window.addEventListener(event, calculatePosition);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, calculatePosition);
      });
    };
  }, [setPositionByRef, calculatePosition]);

  return cloneElement(children, {
    onClick: handleClick,
    ref,
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
  className,
  mainScreenMode,
  mainScreenZIndex,
  elementId,
  includeTippy = false,
}) => {
  const { openedModalName, close, position, isModalAbove } = useContext(ModalContext)!;
  const { outsideClickRef } = useOutsideClick<HTMLElement>(close);
  if (name !== openedModalName) return null;
  return createPortal(
    <>
      <MainScreen mode={mainScreenMode} zIndex={mainScreenZIndex} />
      <section
        className={`modal ${className ? className : name}`}
        style={{ zIndex: mainScreenZIndex + 1, ...position }}
        ref={outsideClickRef}
      >
        {includeTippy && <Tippy isModalAbove={!!isModalAbove} />}
        {children}
      </section>
    </>,
    document.getElementById(elementId)!
  );
};

Modal.OpenBtn = OpenBtn;
Modal.Window = Window;
Modal.CloseBtn = CloseBtn;
