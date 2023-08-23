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
import { useOutsideHover } from "../../../hooks/app/useOusideHover";
import { useInsideHover } from "../../../hooks/app/useInsideHover";

type UserPreviewModalPosition = {
  top?: number;
  bottom?: number;
  left: number;
};

type ModalProps = {
  children: React.ReactNode;
  externalStateControl?: {
    openedModalName: string;
    setOpenedModalName: React.Dispatch<React.SetStateAction<string>>;
  };
  onOpen?: () => void;
  onClose?: () => void;
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

type ModalHoverActivatorProps = {
  children: React.ReactNode;
  modalName: string;
};

type WindowProps = {
  children: React.ReactNode;
  name: string;
  className?: string;
  style?: React.CSSProperties;
  mainScreenMode?: "dark" | "light" | "transparent";
  mainScreenZIndex?: number;
  elementId?: string;
  includeTippy?: boolean;
  closeOnHover?: boolean;
};

type ModalContextType = {
  openedModalName: string;
  close: () => void;
  open: (name: string) => void;
  position: UserPreviewModalPosition | null;
  setPosition: React.Dispatch<React.SetStateAction<UserPreviewModalPosition | null>>;
  isModalAbove: boolean;
  setIsModalAbove: React.Dispatch<React.SetStateAction<boolean>>;
};

function calculatePositionByRef<T extends HTMLElement>(
  ref: React.RefObject<T>,
  modalHeight: number
) {
  const rect = ref.current?.getBoundingClientRect();
  if (!rect) return;
  const windowHeight = window.innerHeight;
  const isModalPositionUp = windowHeight - rect.top < modalHeight;
  const bottomPosition = { top: rect.bottom + rect.height / 2 + window.scrollY };
  const topPosition = { bottom: window.innerHeight - rect.top + rect.height / 2 };

  return {
    isModalAbove: isModalPositionUp,
    position: {
      ...(isModalPositionUp ? topPosition : bottomPosition),
      left: rect.left + rect.width / 2 + window.scrollX,
    },
  };
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const Modal: FC<ModalProps> & {
  OpenBtn: FC<OpenBtnProps>;
  Window: FC<WindowProps>;
  CloseBtn: FC<CloseBtnProps>;
  ModalHoverOpen: FC<ModalHoverActivatorProps>;
} = ({ children, externalStateControl, onClose, onOpen }) => {
  const [openedModalName, setOpenedModalName] = useState("");
  // const [position, setPosition] = useState(null);
  const [position, setPosition] = useState<UserPreviewModalPosition | null>(null);

  const [isModalAbove, setIsModalAbove] = useState(false);

  const close = () => {
    onClose?.();
    if (externalStateControl) return externalStateControl.setOpenedModalName("");
    setOpenedModalName("");
  };
  const open = (name: string) => {
    onOpen?.();
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

const OpenBtn: FC<OpenBtnProps> = ({
  children,
  modalName,
  setPositionByRef = false,
  modalHeight = 0,
}) => {
  const { open, setPosition, setIsModalAbove } = useContext(ModalContext)!;
  const ref = useRef<HTMLButtonElement>(null);

  const calculatePositionByRef = useCallback(() => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const windowHeight = window.innerHeight;
    const isModalPositionUp = windowHeight - rect.top < modalHeight;
    const bottomPosition = { top: rect.bottom + rect.height / 2 + window.scrollY };
    const topPosition = { bottom: window.innerHeight - rect.top + rect.height / 2 };
    setIsModalAbove(isModalPositionUp);
    setPosition({
      ...(isModalPositionUp ? topPosition : bottomPosition),
      left: rect.left + rect.width / 2 + window.scrollX,
    });
  }, [modalHeight, setIsModalAbove, setPosition]);

  const handleClick = () => {
    if (setPositionByRef) calculatePositionByRef();
    open(modalName);
  };

  useEffect(() => {
    if (!setPositionByRef) return;

    const events = ["wheel", "scroll", "resize"];
    events.forEach(event => {
      window.addEventListener(event, calculatePositionByRef);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, calculatePositionByRef);
      });
    };
  }, [setPositionByRef, calculatePositionByRef]);

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

const ModalHoverOpen: FC<ModalHoverActivatorProps> = ({ children, modalName }) => {
  const { open, setPosition, setIsModalAbove } = useContext(ModalContext)!;
  const { insideHoverRef } = useInsideHover<HTMLDivElement>(setPositionAndOpen);

  function setPositionAndOpen() {
    const res = calculatePositionByRef(insideHoverRef, 300);
    if (!res) return;
    setPosition(res.position);
    setIsModalAbove(res.isModalAbove);
    open(modalName);
  }

  return (
    <div className="modal-hover-open" ref={insideHoverRef}>
      {children}
    </div>
  );
};

const Window: FC<WindowProps> = ({
  children,
  name,
  className,
  mainScreenMode = "transparent",
  mainScreenZIndex = 1000,
  elementId = "app",
  includeTippy = false,
  style = {},
  closeOnHover = false,
}) => {
  const { openedModalName, close, position, isModalAbove } = useContext(ModalContext)!;
  const { outsideClickRef } = useOutsideClick<HTMLElement>(close);
  const { outsideHoverRef } = useOutsideHover<HTMLDivElement>(close);

  if (name !== openedModalName) return null;
  return createPortal(
    <>
      {!closeOnHover && <MainScreen mode={mainScreenMode} zIndex={mainScreenZIndex} />}
      <section
        className={`modal ${className ? className : name}`}
        style={{ ...style, zIndex: mainScreenZIndex + 1, ...position }}
        ref={closeOnHover ? outsideHoverRef : outsideClickRef}
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
Modal.ModalHoverOpen = ModalHoverOpen;
