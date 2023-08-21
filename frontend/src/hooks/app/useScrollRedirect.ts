import { useRef, useEffect } from "react";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";

export function useScrollRedirect() {
  const { isScrollRedirectActive } = useSelector((state: RootState) => state.system);
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const redirectScroll = (e: WheelEvent) => {
      if (!scrollTargetRef.current) return;
      scrollTargetRef.current.scrollTop += e.deltaY * 0.4;
    };

    if (isScrollRedirectActive) document.addEventListener("wheel", redirectScroll);
    else document.removeEventListener("wheel", redirectScroll);

    return () => {
      document.removeEventListener("wheel", redirectScroll);
    };
  }, [isScrollRedirectActive]);

  return { scrollTargetRef };
}
