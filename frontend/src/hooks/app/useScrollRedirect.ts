import { useRef, useEffect } from "react";

export function useScrollRedirect() {
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const redirectScroll = (e: WheelEvent) => {
      if (!scrollTargetRef.current) return;
      scrollTargetRef.current.scrollTop += e.deltaY * 0.4;
    };

    const appContent = document.getElementById("app-content");
    if (!appContent) return;

    appContent.addEventListener("wheel", redirectScroll);

    return () => {
      appContent.removeEventListener("wheel", redirectScroll);
    };
  }, []);

  return { scrollTargetRef };
}
