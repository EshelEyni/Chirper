import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCustomSelect } from "../../../hooks/useCustomSelect";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { getDaysInMonth, getTimeZone } from "../../../services/util.service/utils.service";
import "./PostSchedule.scss";
import { CustomSelect } from "../../../components/App/CustomSelect/CustomSelect";
import { PostDateTitle } from "../../../components/Post/PostDateTitle/PostDateTitle";
import { BtnClose } from "../../../components/Btns/BtnClose/BtnClose";
import { MainScreen } from "../../../components/App/MainScreen/MainScreen";

type SetterFunctions = {
  month: (date: Date) => Date;
  day: (date: Date) => Date;
  year: (date: Date) => Date;
  hour: (date: Date) => Date;
  minute: (date: Date) => Date;
  amPm: (date: Date) => Date;
};

export const PostSchedule = () => {
  const { homePage, sideBar, newPostType } = useSelector((state: RootState) => state.newPostModule);
  const currNewPost =
    newPostType === "home-page"
      ? homePage.posts[homePage.currPostIdx]
      : sideBar.posts[sideBar.currPostIdx];
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const getDefaultValues = (type: string) => {
    const defaultNewDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    switch (type) {
      case "schedule":
        return currNewPost.schedule ? new Date(currNewPost.schedule) : defaultNewDate;

      case "month":
        return currNewPost.schedule
          ? new Intl.DateTimeFormat("en-US", { month: "long" }).format(
              new Date(0, currNewPost.schedule.getMonth())
            )
          : new Intl.DateTimeFormat("en-US", { month: "long" }).format(
              new Date(0, defaultNewDate.getMonth())
            );

      case "day":
        return currNewPost.schedule ? currNewPost.schedule.getDate() : defaultNewDate.getDate();

      case "year":
        return currNewPost.schedule
          ? currNewPost.schedule.getFullYear()
          : defaultNewDate.getFullYear();

      case "hour":
        return currNewPost.schedule ? currNewPost.schedule.getHours() : defaultNewDate.getHours();

      case "minute":
        return currNewPost.schedule
          ? currNewPost.schedule.getMinutes()
          : defaultNewDate.getMinutes();

      case "amPm": {
        const hour = currNewPost.schedule
          ? currNewPost.schedule.getHours()
          : defaultNewDate.getHours();
        return hour >= 12 ? "PM" : "AM";
      }
    }
  };

  const [schedule, setSchedule] = useState<Date>(getDefaultValues("schedule") as Date);
  const [isDateInvalid, setIsDateInvalid] = useState<{
    status: boolean;
    location: "date" | "time" | "";
  }>({ status: false, location: "" });

  const daysInSelectedMonth = useMemo(() => {
    return [...Array(getDaysInMonth(schedule.getFullYear(), schedule.getMonth())).keys()].map(
      day => day + 1
    );
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
    setSchedule(prevSchedule => {
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
          const daysInMonth = getDaysInMonth(date.getFullYear(), monthIdx);
          if (date.getDate() > daysInMonth) {
            date.setDate(daysInMonth);
          }
          return new Date(date.setMonth(monthIdx));
        },
        day: (date: Date) => new Date(date.setDate(value as number)),
        year: (date: Date) => {
          const daysInMonth = getDaysInMonth(value as number, date.getMonth());
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
        selectValues: [...Array(12).keys()].map(month =>
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
        selectValues: [...Array(3).keys()].map(year => year + new Date().getFullYear()),
      },
      {
        label: "Hour",
        type: "hour",
        value: getDefaultValues("hour") as number,
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(12).keys()].map(hour => hour + 1),
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
    setInputs(prevInputs => {
      return prevInputs.map(input => {
        if (input.type === "day") {
          return {
            ...input,
            selectValues: [
              ...Array(getDaysInMonth(schedule.getFullYear(), schedule.getMonth())).keys(),
            ].map(day => day + 1),
          };
        }
        return input;
      });
    });
  }, [schedule]);

  const onGoBack = () => {
    navigate("/home");
  };

  const onConfirmSchedule = () => {
    navigate("/home");
    const newPost = { ...currNewPost, schedule };
    dispatch(updateCurrNewPost(newPost, newPostType));
  };

  const onClearSchedule = () => {
    navigate("/home");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schedule, ...postWithOutSchedule } = currNewPost;
    dispatch(updateCurrNewPost(postWithOutSchedule, newPostType));
  };

  const onGoToUnsentPostsPage = () => {
    navigate("/unsent-posts");
  };

  return (
    <>
      <MainScreen onClickFn={onGoBack} mode="dark-light" />
      <section className="post-schedule">
        <header className="post-schedule-header">
          <div className="post-schedule-header-close-btn-title-container">
            <div className="btn-close-container">
              <BtnClose onClickBtn={onGoBack} />
            </div>
            <h3 className="post-schedule-title">Schedule</h3>
          </div>
          <div className="post-schedule-header-btns-container">
            {currNewPost.schedule && (
              <button className="btn-clear-schedule" onClick={onClearSchedule}>
                <span>Clear</span>
              </button>
            )}
            <button
              className={"btn-confirm-schedule" + (isDateInvalid.status ? " disabled" : "")}
              onClick={onConfirmSchedule}
              disabled={isDateInvalid.status}
            >
              {!currNewPost.schedule ? "Confirm" : "Update"}
            </button>
          </div>
        </header>
        <main className="post-schedule-main-container">
          {!isDateInvalid.status && currNewPost.schedule && (
            <PostDateTitle date={currNewPost.schedule} />
          )}

          <div className="date-inputs">
            <h3 className="date-inputs-title">Date</h3>
            <div
              className={
                "date-inputs-container" + (isDateInvalid.location === "date" ? " error" : "")
              }
            >
              {inputs.slice(0, 3).map(input => (
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
              {inputs.slice(3, 6).map(input => (
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
              <p className="time-zone-value">{getTimeZone()}</p>
            </div>
          </div>
        </main>
        <footer className="post-schedule-footer">
          <button className="btn-go-to-unsent-chirp" onClick={onGoToUnsentPostsPage}>
            Schedule Chirps
          </button>
        </footer>
      </section>
    </>
  );
};
