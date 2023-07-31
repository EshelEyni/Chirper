import { FC } from "react";
import "./BtnShowThread.scss";
import { usePostPreview } from "../../../contexts/PostPreviewContext";

export const BtnShowThread: FC = () => {
  const { onNavigateToPostDetails } = usePostPreview();
  return (
    <button className="btn-show-thread" onClick={onNavigateToPostDetails}>
      <span>Show this thread</span>
    </button>
  );
};
