import { MouseEvent } from "react";
import { IoChevronDownSharp } from "react-icons/io5";
import "./CustomSelect.scss";

interface CustomSelectProps {
  input: {
    label: string;
    type: string;
    value: number | string;
    isDisabled: boolean;
    isFocused: boolean;
    isDropdownOpen: boolean;
    selectValues: number[] | string[];
  };
  onFocused: (type: string) => void;
  onBlurred: (type: string) => void;
  onSelected: (e: MouseEvent, value: number | string, type: string) => void;
  onToggleDropdown: (type: string) => void;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  input,
  onFocused,
  onBlurred,
  onSelected,
  onToggleDropdown,
}) => {
  return (
    <div
      className={
        "custom-select-container" +
        (input.isFocused ? " focused" : "") +
        (input.isDisabled ? " disabled" : "")
      }
      key={input.type}
      tabIndex={0}
      onFocus={() => onFocused(input.type)}
      onClick={() => {
        if (input.isDisabled) return;
        onToggleDropdown(input.type);
      }}
      onBlur={() => onBlurred(input.type)}
      data-testid="custom-select"
    >
      <div className="custom-select">
        <div className="custom-select-data-text">
          <span className="custom-select-label">{`${input.label}`}</span>
          <span className="custom-select-value">{input.value}</span>
        </div>
        <IoChevronDownSharp className="custom-select-icon" />
      </div>
      {input.isDropdownOpen && (
        <div className="custom-select-dropdown">
          {input.selectValues.map(value => (
            <div
              className="custom-select-dropdown-item"
              key={value}
              onClick={e => onSelected(e, value, input.type)}
            >
              {value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
