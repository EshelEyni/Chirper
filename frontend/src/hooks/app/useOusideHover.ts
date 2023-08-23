import { useEffect, useRef, MutableRefObject } from "react";
import { useRefDebounce } from "./useRefDebounce";

type OutsideHoverHandler = () => void;

type OutsideHoverRef<T extends HTMLElement> = {
  outsideHoverRef: MutableRefObject<T | null>;
};

export function useOutsideHover<T extends HTMLElement>(
  handler: OutsideHoverHandler,
  listenCapturing = true
): OutsideHoverRef<T> {
  const ref = useRef<T | null>(null);

  const { debouncedFunc } = useRefDebounce(handler, 200);

  useEffect(() => {
    function handleHover(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) debouncedFunc();
    }

    document.addEventListener("mouseleave", handleHover, listenCapturing);

    return () => {
      document.removeEventListener("mouseleave", handleHover, listenCapturing);
    };
  }, [handler, listenCapturing, debouncedFunc]);

  return { outsideHoverRef: ref };
}
