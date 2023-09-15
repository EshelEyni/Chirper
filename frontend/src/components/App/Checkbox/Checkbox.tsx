import { FC } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import "./Checkbox.scss";

type CheckboxProps = {
  isChecked: boolean;
};

export const Checkbox: FC<CheckboxProps> = ({ isChecked }) => {
  return (
    <div className={"checkbox" + (isChecked ? " checked" : " unchecked")} data-testid="checkbox">
      {isChecked && (
        <AiFillCheckCircle size={24} color="var(--color-primary)" data-testid="checkbox-icon" />
      )}
    </div>
  );
};
