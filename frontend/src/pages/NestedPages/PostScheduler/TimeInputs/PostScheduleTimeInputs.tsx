import { FC, useEffect } from "react";
import { useCustomSelect } from "../../../../hooks/useCustomSelect";
import { CustomSelect } from "../../../../components/App/CustomSelect/CustomSelect";
import { getDaysInMonth } from "../../../../services/util/utils.service";
import { invalidDateStatus } from "../PostSchedule";
import "./PostScheduleTimeInputs.scss";

type PostScheduleTimeInputsProps = {
  isDateInvalid: boolean;
  schedule: Date;
  setSchedule: React.Dispatch<React.SetStateAction<Date>>;
  setIsDateInvalid: React.Dispatch<React.SetStateAction<invalidDateStatus>>;
  getErrorLocation: (newDate: Date) => "time" | "date";
};

type SetterFunctions = {
  hour: (date: Date) => Date;
  minute: (date: Date) => Date;
  amPm: (date: Date) => Date;
};

export const PostScheduleTimeInputs: FC<PostScheduleTimeInputsProps> = ({
  isDateInvalid,
  schedule,
  setSchedule,
  setIsDateInvalid,
  getErrorLocation,
}) => {
  const { inputs, setInputs, onFocused, onBlurred, onToggleDropdown, onSelected } = useCustomSelect(
    [
      {
        label: "Hour",
        type: "hour",
        value: schedule.getHours(),
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(12).keys()].map(hour => hour + 1),
      },
      {
        label: "Minute",
        type: "minute",
        value: schedule.getMinutes(),
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(60).keys()],
      },
      {
        label: "AM/PM",
        type: "amPm",
        value: schedule.getHours() >= 12 ? "PM" : "AM",
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: ["AM", "PM"],
      },
    ],
    handleValueChange
  );

  const setterFunctions = {
    hour: (value: string | number, date: Date) => new Date(date.setHours(value as number)),
    minute: (value: string | number, date: Date) => new Date(date.setMinutes(value as number)),
    amPm: (value: string | number, date: Date) => {
      const hours = (date.getHours() % 12) + (value === "AM" ? 0 : 12);
      return new Date(date.setHours(hours));
    },
  };

  function handleValueChange(inputType: string, value: string | number) {
    setSchedule(prevSchedule => {
      const setterFunction = setterFunctions[inputType as keyof SetterFunctions];
      if (!setterFunction) return prevSchedule;
      const newDate = setterFunction(value, prevSchedule);
      const newTimeStamp = newDate.getTime();
      const currTimeStampPlusMinute = Date.now() + 60000;
      if (newTimeStamp < currTimeStampPlusMinute) {
        const location = getErrorLocation(newDate);
        setIsDateInvalid({ status: true, location });
        return prevSchedule;
      }
      setIsDateInvalid({ status: false, location: "" });
      return newDate;
    });
  }

  useEffect(() => {
    setInputs(prevInputs =>
      prevInputs.map(input => {
        return {
          ...input,
          selectValues: [
            ...Array(getDaysInMonth(schedule.getFullYear(), schedule.getMonth())).keys(),
          ].map(day => day + 1),
        };
      })
    );
  }, [schedule, setInputs]);

  return (
    <div className="time-inputs">
      <h3 className="time-inputs-title">Time</h3>
      <div className={"time-inputs-container" + (isDateInvalid ? " error" : "")}>
        {inputs.map(input => (
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
      {isDateInvalid && (
        <p className="schedule-inputs-error-msg">You can’t schedule a Chirp to send in the past.</p>
      )}
    </div>
  );
};
