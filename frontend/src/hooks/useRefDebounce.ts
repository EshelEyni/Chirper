import { useEffect, useRef } from "react";
import { debounce } from "../services/util/utilService";

type DebouncedFunc = () => void;

export function useRefDebounce(handler: DebouncedFunc, delay: number) {
  const debouncedHandler = useRef(debounce(handler, delay));

  useEffect(() => {
    const currentDebounce = debouncedHandler.current;
    return () => {
      currentDebounce.cancel();
    };
  }, [handler]);

  return {
    debouncedFunc: debouncedHandler.current.debouncedFunc,
    cancel: debouncedHandler.current.cancel,
  };
}
