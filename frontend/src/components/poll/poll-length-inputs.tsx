import { MouseEvent, Dispatch, SetStateAction, FC, useEffect } from "react";
import { Poll } from "../../../../shared/interfaces/post.interface";
import { CustomSelect } from "../other/custom-select";
import { useCustomSelect } from "../../hooks/useCustomSelect";

interface PollLengthInputsProps {
  poll: Poll;
  setPoll: Dispatch<SetStateAction<Poll | null>>;
}

export const PollLengthInputs: FC<PollLengthInputsProps> = ({
  poll,
  setPoll,
}) => {
  const handleValueChange = (inputType: string, value: number | string) => {
    setPoll((prevPoll) => {
      if (prevPoll) {
        if (inputType === "days" && value === 7) {
          return {
            ...prevPoll,
            length: {
              ...prevPoll.length,
              days: value,
              hours: 0,
              minutes: 0,
            },
          };
        }
        return {
          ...prevPoll,
          length: {
            ...prevPoll.length,
            [inputType]: value,
          },
        };
      }
      return null;
    });
  };

  useEffect(() => {
    setInputs((prevInputs) => {
      return prevInputs.map((input) => {
        if (input.type === "hours" || input.type === "minutes") {
          return {
            ...input,
            isDisabled: poll.length.days === 7,
            value: poll.length.days === 7 ? 0 : input.value,
          };
        }
        return input;
      });
    });
  }, [poll.length.days]);

  const {
    inputs,
    setInputs,
    onFocused,
    onBlurred,
    onToggleDropdown,
    onSelected,
  } = useCustomSelect(
    [
      {
        label: "Days",
        type: "days",
        value: poll.length.days,
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(8).keys()],
      },
      {
        label: "Hours",
        type: "hours",
        value: poll.length.hours,
        isDisabled: poll.length.days === 7,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(24).keys()],
      },
      {
        label: "Minutes",
        type: "minutes",
        value: poll.length.minutes,
        isDisabled: poll.length.days === 7,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(60).keys()],
      },
    ],
    handleValueChange
  );

  return (
    <section className="poll-length">
      <h3 className="poll-length-title">Poll length</h3>
      <div className="poll-length-inputs-container">
        {inputs.map((input) => (
          <CustomSelect
            input={input}
            key={input.type}
            onSelected={onSelected}
            onFocused={onFocused}
            onBlurred={onBlurred}
            onToggleDropdown={onToggleDropdown}
          />
        ))}
      </div>
    </section>
  );
};
