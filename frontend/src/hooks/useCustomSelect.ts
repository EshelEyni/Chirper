import { useState, MouseEvent } from "react";

type CustomSelectInput = {
  label: string;
  type: string;
  value: number | string;
  isDisabled: boolean;
  isFocused: boolean;
  isDropdownOpen: boolean;
  selectValues: number[] | string[];
};

export const useCustomSelect = (
  initialState: CustomSelectInput[],
  onValueChange: (inputType: string, value: number | string) => void
) => {
  const [inputs, setInputs] = useState(initialState);

  const onFocused = (type: string) => {
    setInputs(
      inputs.map((input) => {
        if (input.type === type) {
          return { ...input, isFocused: true };
        }
        return { ...input, isFocused: false };
      })
    );
  };

  const onBlurred = (type: string) => {
    setInputs(
      inputs.map((input) => {
        if (input.type === type) {
          return { ...input, isFocused: false, isDropdownOpen: false };
        }
        return input;
      })
    );
  };

  const onToggleDropdown = (type: string) => {
    setInputs(
      inputs.map((input) => {
        if (input.type === type) {
          return { ...input, isDropdownOpen: !input.isDropdownOpen };
        }
        return input;
      })
    );
  };

  const onSelected = async (
    e: MouseEvent,
    value: string | number,
    type: string
  ) => {
    e.stopPropagation();
    onValueChange(type, value);
    setInputs(
      inputs.map((input) => {
        if (input.type === type) {
          return { ...input, isDropdownOpen: false, value };
        }
        return input;
      })
    );
  };

  return {
    inputs,
    setInputs,
    onFocused,
    onBlurred,
    onToggleDropdown,
    onSelected,
  };
};
