import { FC, useEffect, useMemo } from "react";
import { CustomSelect } from "../../components/App/CustomSelect/CustomSelect";
import { useCustomSelect } from "../../hooks/useCustomSelect";
import { getDaysInMonth, months } from "../../services/util/utilService";
import { invalidDateStatus } from "./PostSchedule";
import "./PostScheduleDateInputs.scss";

type PostScheduleDateInputsProps = {
  isDateInvalid: boolean;
  schedule: Date;
  setSchedule: React.Dispatch<React.SetStateAction<Date>>;
  setIsDateInvalid: React.Dispatch<React.SetStateAction<invalidDateStatus>>;
  getErrorLocation: (newDate: Date) => "time" | "date";
};

type SetterFunctions = {
  month: (date: Date) => Date;
  day: (date: Date) => Date;
  year: (date: Date) => Date;
};

export const PostScheduleDateInputs: FC<PostScheduleDateInputsProps> = ({
  isDateInvalid,
  schedule,
  setSchedule,
  setIsDateInvalid,
  getErrorLocation,
}) => {
  const daysInSelectedMonth = useMemo(() => {
    return [...Array(getDaysInMonth(schedule.getFullYear(), schedule.getMonth())).keys()].map(
      day => day + 1
    );
  }, [schedule]);

  const { inputs, setInputs, onFocused, onBlurred, onToggleDropdown, onSelected } = useCustomSelect(
    [
      {
        label: "Month",
        type: "month",
        value: new Intl.DateTimeFormat("en-US", { month: "long" }).format(
          new Date(0, schedule.getMonth())
        ),
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(12).keys()].map(month =>
          new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(0, month))
        ),
      },
      {
        label: "Day",
        type: "day",
        value: schedule.getDate(),
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: daysInSelectedMonth,
      },
      {
        label: "Year",
        type: "year",
        value: schedule.getFullYear(),
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(3).keys()].map(year => year + new Date().getFullYear()),
      },
    ],
    handleValueChange
  );

  const setterFunctions = {
    month: (value: string | number, date: Date) => {
      const monthIdx = months.map(m => m.full).indexOf(value as string);
      const daysInMonth = getDaysInMonth(date.getFullYear(), monthIdx);
      if (date.getDate() > daysInMonth) date.setDate(daysInMonth);
      return new Date(date.setMonth(monthIdx));
    },
    day: (value: string | number, date: Date) => new Date(date.setDate(value as number)),
    year: (value: string | number, date: Date) => {
      const daysInMonth = getDaysInMonth(value as number, date.getMonth());
      if (date.getDate() > daysInMonth) date.setDate(daysInMonth);
      return new Date(date.setFullYear(value as number));
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
        if (input.type !== "day") return input;
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
    <div className="date-inputs">
      <h3 className="date-inputs-title">Date</h3>
      <div className={"date-inputs-container" + (isDateInvalid ? " error" : "")}>
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
