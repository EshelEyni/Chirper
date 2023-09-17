import { FC } from "react";
import "./Button.scss";

type ButtonProps = {
  className?: string;
  children: React.ReactNode;
  isDisabled?: boolean;
  onClickFn?: () => void;
};

export const Button: FC<ButtonProps> = ({ className, children, isDisabled = false, onClickFn }) => {
  return (
    <button className={className} onClick={onClickFn} disabled={isDisabled} data-testid={className}>
      {children}
    </button>
  );
};
