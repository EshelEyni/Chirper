import { useMemo } from "react";
import "./TextIndicator.scss";
import { usePostEdit } from "../../Post/PostEdit/PostEditContext";

export const TextIndicator: React.FC = () => {
  const { newPostText } = usePostEdit();
  const textLength = newPostText.length;

  const progressBarStyle = useMemo(() => {
    const percentage = (textLength / 247) * 100;
    let background;

    if (textLength < 227) {
      background = `radial-gradient(closest-side, white 79%, transparent 80% 100%),
       conic-gradient(var(--color-primary) ${percentage}%, rgb(239,243,244) 0)`;
    } else if (textLength < 247) {
      background = `radial-gradient(closest-side, white 79%, transparent 80% 100%),
         conic-gradient(var(--color-warning) ${percentage}%, rgb(239,243,244) 0)`;
    } else if (textLength < 257) {
      background = `radial-gradient(closest-side, white 79%, transparent 80% 100%),
         conic-gradient(var(--color-danger) 100%, rgb(239,243,244) 0)`;
    } else {
      background = `none`;
    }

    return {
      background,
    };
  }, [textLength]);

  return (
    <div className="text-indicator" style={progressBarStyle}>
      {textLength > 227 && (
        <span className={textLength >= 247 ? "text-danger" : ""}>{247 - textLength}</span>
      )}
    </div>
  );
};
