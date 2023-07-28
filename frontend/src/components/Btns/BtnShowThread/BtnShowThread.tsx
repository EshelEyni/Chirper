import { FC } from "react";
import "./BtnShowThread.scss";

type BtnShowThreadProps = {
  onHandleClick: () => void;
};

export const BtnShowThread: FC<BtnShowThreadProps> = ({ onHandleClick }) => {
  return (
    <button className="btn-show-thread" onClick={onHandleClick}>
      <span>Show this thread</span>
    </button>
  );
};
