import { useState, useRef, useEffect } from "react";
import { debounce } from "../services/util/utils.service";

type ElementsHoverState = {
  [elementName: string]: boolean;
};

export const useCustomElementHover = (initialElementsState: ElementsHoverState) => {
  const [elementsHoverState, setElementsHoverState] = useState(initialElementsState);

  const debounced = useRef(
    debounce((elementName: string) => {
      setElementsHoverState(prev => ({
        ...prev,
        [elementName]: !prev[elementName],
      }));
    }, 500)
  );

  useEffect(() => {
    const currentDebounce = debounced.current;

    return () => {
      currentDebounce.cancel();
    };
  }, []);

  const handleMouseEnter = (elementName: string) => {
    debounced.current.debouncedFunc(elementName);
  };

  const handleMouseLeave = (elementName: string) => {
    debounced.current.cancel();
    setElementsHoverState(prev => ({
      ...prev,
      [elementName]: false,
    }));
  };

  return { elementsHoverState, handleMouseEnter, handleMouseLeave };
};
