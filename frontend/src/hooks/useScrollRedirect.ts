import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../types/app";

export function useScrollRedirect() {
  const { isScrollRedirectActive } = useSelector((state: RootState) => state.system);
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const redirectScroll = (e: WheelEvent) => {
      if (!scrollTargetRef.current) return;
      scrollTargetRef.current.scrollTop += e.deltaY * 0.75;
    };

    if (isScrollRedirectActive) document.addEventListener("wheel", redirectScroll);
    else document.removeEventListener("wheel", redirectScroll);

    return () => {
      document.removeEventListener("wheel", redirectScroll);
    };
  }, [isScrollRedirectActive]);

  return { scrollTargetRef };
}
