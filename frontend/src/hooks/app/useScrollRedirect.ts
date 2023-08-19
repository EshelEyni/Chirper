import { useRef, useEffect } from "react";

export function useScrollRedirect() {
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const redirectScroll = (e: WheelEvent) => {
      if (scrollTargetRef.current) {
        scrollTargetRef.current.scrollTop += e.deltaY * 0.4;
      }
    };

    window.addEventListener("wheel", redirectScroll);

    return () => {
      window.removeEventListener("wheel", redirectScroll);
    };
  }, []);

  return { scrollTargetRef };
}
