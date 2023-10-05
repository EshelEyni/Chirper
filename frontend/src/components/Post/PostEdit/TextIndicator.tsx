import { useMemo } from "react";
import "./TextIndicator.scss";
import { usePostEdit } from "../../../contexts/PostEditContext";

function _generateGradient(percentage: number, colorVar: string) {
  return `radial-gradient(closest-side, white 79%, transparent 80% 100%),
    conic-gradient(var(${colorVar}) ${percentage > 100 ? 100 : percentage}%, rgb(239,243,244) 0)`;
}

export const TextIndicator: React.FC = () => {
  const { newPostText } = usePostEdit();
  const textLength = newPostText.length;

  const progressBarStyle = useMemo(() => {
    const percentage = (textLength / 247) * 100;
    let background;

    if (textLength < 227) background = _generateGradient(percentage, "--color-primary");
    else if (textLength < 247) background = _generateGradient(percentage, "--color-warning");
    else if (textLength < 257) background = _generateGradient(100, "--color-danger");
    else background = `none`;

    return { background };
  }, [textLength]);

  return (
    <div className="text-indicator" style={progressBarStyle}>
      {textLength > 227 && (
        <span
          className={textLength >= 247 ? "text-danger" : ""}
          data-testid="text-indicator-remaining"
        >
          {247 - textLength}
        </span>
      )}
    </div>
  );
};
