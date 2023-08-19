import { useEffect, useRef, MutableRefObject } from "react";

type OutsideClickHandler = () => void;

type OutsideClickRef = {
  outsideClickRef: MutableRefObject<HTMLElement | null>;
};

export function useOutsideClick(
  handler: OutsideClickHandler,
  listenCapturing = true
): OutsideClickRef {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    }

    document.addEventListener("click", handleClick, listenCapturing);

    return () => document.removeEventListener("click", handleClick, listenCapturing);
  }, [handler, listenCapturing]);

  return { outsideClickRef: ref };
}
