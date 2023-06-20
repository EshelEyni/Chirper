import { useRef, useState } from "react";

export const useModalPosition = <T extends HTMLElement>({
  modalHeight,
}: {
  modalHeight: number;
}) => {
  const elementRef = useRef<T | null>(null);

  const [isModalAbove, setIsModalAbove] = useState(false);

  const updateModalPosition = () => {
    if (elementRef.current) {
      const { top } = elementRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isModalPositionUp = windowHeight - top < modalHeight;
      setIsModalAbove(isModalPositionUp);
    }
  };

  return { elementRef, isModalAbove, updateModalPosition };
};
