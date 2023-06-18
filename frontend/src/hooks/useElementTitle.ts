import { useState, useRef, useEffect } from "react";
import { utilService } from "../services/util.service/utils.service";

export const useElementTitle = () => {
  const [isElementShown, setIsElementShown] = useState(false);

  const debounced = useRef(
    utilService.debounce(() => {
      setIsElementShown(true);
    }, 500)
  );

  useEffect(() => {
    return () => {
      debounced.current.cancel();
    };
  }, []);

  const handleMouseEnter = () => {
    debounced.current.debouncedFunc();
  };

  const handleMouseLeave = () => {
    debounced.current.cancel();
    setIsElementShown(false);
  };

  return { isElementShown, handleMouseEnter, handleMouseLeave };
};
