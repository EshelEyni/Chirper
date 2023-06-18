import { useState, useRef, useEffect } from "react";
import { utilService } from "../services/util.service/utils.service";

type ElementsHoverState = {
  [elementName: string]: boolean;
};

export const useCustomElementHover = (initialElementsState: ElementsHoverState) => {
  const [elementsHoverState, setElementsHoverState] = useState(initialElementsState);

  const debounced = useRef(
    utilService.debounce((elementName: string) => {
      setElementsHoverState(prevState => ({
        ...prevState,
        [elementName]: true,
      }));
    }, 500)
  );

  useEffect(() => {
    return () => {
      debounced.current.cancel();
    };
  }, []);

  const handleMouseEnter = (elementName: string) => {
    debounced.current.debouncedFunc(elementName);
  };

  const handleMouseLeave = (elementName: string) => {
    debounced.current.cancel();
    setElementsHoverState(prevState => ({
      ...prevState,
      [elementName]: false,
    }));
  };

  return { elementsHoverState, handleMouseEnter, handleMouseLeave };
};
