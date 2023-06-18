import { useRef, useState } from "react";

export const useModalPosition = ({ modalHeight }: { modalHeight: number }) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [isModalAbove, setIsModalAbove] = useState(false);

  const updateModalPosition = () => {
    if (btnRef.current) {
      const { top } = btnRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isModalPositionUp = windowHeight - top < modalHeight;
      setIsModalAbove(isModalPositionUp);
    }
  };

  return { btnRef, isModalAbove, updateModalPosition };
};
