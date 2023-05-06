import { BtnClose } from "../../components/btns/btn-close";
import { Fragment, useEffect, useMemo, useState } from "react";
import { PostDateTitle } from "../../components/other/post-date-title";
import { useCustomSelect } from "../../hooks/useCustomSelect";
import { CustomSelect } from "../../components/other/custom-select";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setNewPost } from "../../store/actions/post.actions";
import { AppDispatch } from "../../store/types";
import { utilService } from "../../services/util.service/utils.service";

type SetterFunctions = {
  month: (date: Date) => Date;
  day: (date: Date) => Date;
  year: (date: Date) => Date;
  hour: (date: Date) => Date;
  minute: (date: Date) => Date;
  amPm: (date: Date) => Date;
};

export const PostSchedule = () => {
  const { newPost } = useSelector((state: RootState) => state.postModule);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const getDefaultValues = (type: string) => {
    switch (type) {
      case "schedule":
        return newPost.schedule
          ? new Date(newPost.schedule)
          : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      case "month":
        return newPost.schedule
          ? new Intl.DateTimeFormat("en-US", { month: "long" }).format(
              new Date(0, newPost.schedule.getMonth())
            )
          : new Intl.DateTimeFormat("en-US", { month: "long" }).format(
              new Date(0, new Date().getMonth())
            );

      case "day":
        return newPost.schedule ? newPost.schedule.getDate() : new Date().getDate() + 5;

      case "year":
        return newPost.schedule ? newPost.schedule.getFullYear() : new Date().getFullYear();

      case "hour":
        return newPost.schedule ? newPost.schedule.getHours() : new Date().getHours();

      case "minute":
        return newPost.schedule ? newPost.schedule.getMinutes() : new Date().getMinutes();

      case "amPm":
        return newPost.schedule
          ? new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: true }).format(
              new Date(0, 0, 0, newPost.schedule.getHours())
            )
          : new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: true }).format(
              new Date(0, 0, 0, new Date().getHours())
            );
    }
  };

  const [schedule, setSchedule] = useState<Date>(getDefaultValues("schedule") as Date);
  const [isDateInvalid, setIsDateInvalid] = useState<{
    status: boolean;
    location: "date" | "time" | "";
  }>({ status: false, location: "" });

  const daysInSelectedMonth = useMemo(() => {
    return [
      ...Array(utilService.getDaysInMonth(schedule.getFullYear(), schedule.getMonth())).keys(),
    ].map((day) => day + 1);
  }, [schedule]);

  const getErrorLocation = (newDate: Date): "time" | "date" => {
    const newMonth = newDate.getMonth();
    const newDay = newDate.getDate();

    const currDate = new Date();
    const currMonth = currDate.getMonth();
    const currDay = currDate.getDate();

    if (newMonth === currMonth && newDay === currDay) {
      return "time";
    }
    return "date";
  };

  const handleValueChange = (inputType: string, value: string | number) => {
    setSchedule((prevSchedule) => {
      let monthIdx: number;
      if (inputType === "month") {
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        monthIdx = monthNames.indexOf(value as string);
      }

      const setterFunctions = {
        month: (date: Date) => {
          const daysInMonth = utilService.getDaysInMonth(date.getFullYear(), monthIdx);
          if (date.getDate() > daysInMonth) {
            date.setDate(daysInMonth);
          }
          return new Date(date.setMonth(monthIdx));
        },
        day: (date: Date) => new Date(date.setDate(value as number)),
        year: (date: Date) => {
          const daysInMonth = utilService.getDaysInMonth(value as number, date.getMonth());
          if (date.getDate() > daysInMonth) {
            date.setDate(daysInMonth);
          }
          return new Date(date.setFullYear(value as number));
        },
        hour: (date: Date) => new Date(date.setHours(value as number)),
        minute: (date: Date) => new Date(date.setMinutes(value as number)),
        amPm: (date: Date) => {
          const hours = (date.getHours() % 12) + (value === "AM" ? 0 : 12);
          return new Date(date.setHours(hours));
        },
      };
      const setterFunction = setterFunctions[inputType as keyof SetterFunctions];
      if (!setterFunction) return prevSchedule;

      const newDate = setterFunction(prevSchedule);
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
  };

  const { inputs, setInputs, onFocused, onBlurred, onToggleDropdown, onSelected } = useCustomSelect(
    [
      {
        label: "Month",
        type: "month",
        value: getDefaultValues("month") as string,
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(12).keys()].map((month) =>
          new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(0, month))
        ),
      },
      {
        label: "Day",
        type: "day",
        value: getDefaultValues("day") as number,
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: daysInSelectedMonth,
      },
      {
        label: "Year",
        type: "year",
        value: getDefaultValues("year") as number,
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(3).keys()].map((year) => year + new Date().getFullYear()),
      },
      {
        label: "Hour",
        type: "hour",
        value: getDefaultValues("hour") as number,
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(12).keys()].map((hour) => hour + 1),
      },
      {
        label: "Minute",
        type: "minute",
        value: getDefaultValues("minute") as number,
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(60).keys()],
      },
      {
        label: "AM/PM",
        type: "amPm",
        value: getDefaultValues("amPm") as string,
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: ["AM", "PM"],
      },
    ],
    handleValueChange
  );

  useEffect(() => {
    setInputs((prevInputs) => {
      return prevInputs.map((input) => {
        if (input.type === "day") {
          return {
            ...input,
            selectValues: [
              ...Array(
                utilService.getDaysInMonth(schedule.getFullYear(), schedule.getMonth())
              ).keys(),
            ].map((day) => day + 1),
          };
        }
        return input;
      });
    });
  }, [schedule]);

  const onGoBack = () => {
    navigate("");
  };

  const onConfirmSchedule = () => {
    navigate("");
    dispatch(setNewPost({ ...newPost, schedule }));
  };

  const onClearSchedule = () => {
    navigate("");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schedule, ...postWithOutSchedule } = newPost;
    dispatch(setNewPost(postWithOutSchedule));
  };

  const onGoToUnsentPostsPage = () => {
    navigate("/unsent-posts");
  };

  return (
    <Fragment>
      <div className="main-screen dark-light" onClick={onGoBack}></div>
      <section className="post-schedule">
        <header className="post-schedule-header">
          <div className="post-schedule-header-close-btn-title-container">
            <div className="btn-close-container">
              <BtnClose onClickBtn={onGoBack} />
            </div>
            <h3 className="post-schedule-title">Schedule</h3>
          </div>
          <div className="post-schedule-header-btns-container">
            {newPost.schedule && (
              <button className="btn-clear-schedule" onClick={onClearSchedule}>
                <span>Clear</span>
              </button>
            )}
            <button
              className={"btn-confirm-schedule" + (isDateInvalid.status ? " disabled" : "")}
              onClick={onConfirmSchedule}
              disabled={isDateInvalid.status}
            >
              {!newPost.schedule ? "Confirm" : "Update"}
            </button>
          </div>
        </header>
        <main className="post-schedule-main-container">
          {!isDateInvalid.status && <PostDateTitle date={schedule ? schedule : new Date()} />}

          <div className="date-inputs">
            <h3 className="date-inputs-title">Date</h3>
            <div
              className={
                "date-inputs-container" + (isDateInvalid.location === "date" ? " error" : "")
              }
            >
              {inputs.slice(0, 3).map((input) => (
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
            {isDateInvalid.location === "date" && (
              <p className="schedule-inputs-error-msg">
                You can’t schedule a Chirp to send in the past.
              </p>
            )}
          </div>
          <div className="time-inputs">
            <h3 className="time-inputs-title">Time</h3>
            <div
              className={
                "time-inputs-container" + (isDateInvalid.location === "time" ? " error" : "")
              }
            >
              {inputs.slice(3, 6).map((input) => (
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
            {isDateInvalid.location === "time" && (
              <p className="schedule-inputs-error-msg">
                You can’t schedule a Chirp to send in the past.
              </p>
            )}
          </div>
          <div className="time-zone">
            <h3 className="time-zone-title">Time Zone</h3>
            <div className="time-zone-container">
              <p className="time-zone-value">{utilService.getTimeZone()}</p>
            </div>
          </div>
        </main>
        <footer className="post-schedule-footer">
          <button className="btn-go-to-unsent-chirp" onClick={onGoToUnsentPostsPage}>
            Schedule Chirps
          </button>
        </footer>
      </section>
    </Fragment>
  );
};
