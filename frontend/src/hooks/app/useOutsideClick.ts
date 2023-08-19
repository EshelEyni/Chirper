import { useEffect, useRef, MutableRefObject } from "react";

type OutsideClickHandler = () => void;

type OutsideClickRef<T extends HTMLElement> = {
  outsideClickRef: MutableRefObject<T | null>;
};

export function useOutsideClick<T extends HTMLElement>(
  handler: OutsideClickHandler,
  listenCapturing = true
): OutsideClickRef<T> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    }

    document.addEventListener("click", handleClick, listenCapturing);

    return () => document.removeEventListener("click", handleClick, listenCapturing);
  }, [handler, listenCapturing]);

  return { outsideClickRef: ref };
}
