import { useEffect, useRef, MutableRefObject } from "react";
import { useRefDebounce } from "./useRefDebounce";

type InsideHoverHandler = () => void;

type InsideHoverRef<T extends HTMLElement> = {
  insideHoverRef: MutableRefObject<T | null>;
};

export function useInsideHover<T extends HTMLElement>(
  handler: InsideHoverHandler,
  listenCapturing = true
): InsideHoverRef<T> {
  const ref = useRef<T | null>(null);

  const { debouncedFunc } = useRefDebounce(handler, 500);

  useEffect(() => {
    function handleHover(e: MouseEvent) {
      if (e.target === ref.current) debouncedFunc();
    }

    const element = ref.current;
    element?.addEventListener("mouseenter", handleHover, listenCapturing);

    return () => {
      element?.removeEventListener("mouseenter", handleHover, listenCapturing);
    };
  }, [handler, listenCapturing, debouncedFunc]);

  return { insideHoverRef: ref };
}
