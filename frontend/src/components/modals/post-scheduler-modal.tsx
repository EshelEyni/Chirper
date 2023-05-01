import { BtnClose } from "../btns/btn-close";
import { UIElement } from "../btns/post-edit-action-btns";
import {
  Dispatch,
  FC,
  Fragment,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { PostDateTitle } from "../other/post-date-title";
import { useCustomSelect } from "../../hooks/useCustomSelect";
import { CustomSelect } from "../other/custom-select";
import { useNavigate } from "react-router-dom";
import { NewPost } from "../../../../shared/interfaces/post.interface";

interface PostSchedulerModalProps {
  post: NewPost;
  setPost: Dispatch<SetStateAction<NewPost>>;
  onToggleElementVisibility: (element: UIElement) => void;
}

type SetterFunctions = {
  month: (date: Date) => Date;
  day: (date: Date) => Date;
  year: (date: Date) => Date;
  hour: (date: Date) => Date;
  minute: (date: Date) => Date;
  amPm: (date: Date) => Date;
};

export const PostSchedulerModal: FC<PostSchedulerModalProps> = ({
  post,
  setPost,
  onToggleElementVisibility,
}) => {
  const [schedule, setSchedule] = useState<Date>(
    post.schedule || (new Date() as Date)
  );
  const [currentYearMonth, setCurrentYearMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const navigate = useNavigate();

  const handleValueChange = (inputType: string, value: string | number) => {
    setSchedule((prevSchedule) => {
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
        value = monthNames.indexOf(value as string) + 1;
      }

      if (inputType === "year" || inputType === "month") {
        console.log("inputType", inputType);
        
        setCurrentYearMonth((prev) => ({
          ...prev,
          [inputType]: value,
        }));
      }

      const setterFunctions = {
        month: (date: Date) => new Date(date.setMonth(value as number)),
        day: (date: Date) => new Date(date.setDate(value as number)),
        year: (date: Date) => new Date(date.setFullYear(value as number)),
        hour: (date: Date) => new Date(date.setHours(value as number)),
        minute: (date: Date) => new Date(date.setMinutes(value as number)),
        amPm: (date: Date) =>
          new Date(
            date.setHours(
              value === "AM" ? date.getHours() - 12 : date.getHours() + 12
            )
          ),
      };
      const setterFunction =
        setterFunctions[inputType as keyof SetterFunctions];
      return setterFunction ? setterFunction(prevSchedule) : prevSchedule;
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

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
        label: "Month",
        type: "month",
        value: new Intl.DateTimeFormat("en-US", { month: "long" }).format(
          new Date(0, new Date().getMonth())
        ),
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(12).keys()].map((month) =>
          new Intl.DateTimeFormat("en-US", { month: "long" }).format(
            new Date(0, month)
          )
        ),
      },
      {
        label: "Day",
        type: "day",
        value: new Date().getDate(),
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [
          ...Array(
            getDaysInMonth(schedule.getFullYear(), schedule.getMonth() + 1)
          ).keys(),
        ].map((day) => day + 1),
      },
      {
        label: "Year",
        type: "year",
        value: new Date().getFullYear(),
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(3).keys()].map(
          (year) => year + new Date().getFullYear()
        ),
      },
      {
        label: "Hour",
        type: "hour",
        value: new Date().getHours(),
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(24).keys()],
      },
      {
        label: "Minute",
        type: "minute",
        value: new Date().getMinutes(),
        isDisabled: false,
        isFocused: false,
        isDropdownOpen: false,
        selectValues: [...Array(60).keys()],
      },
      {
        label: "AM/PM",
        type: "amPm",
        value: new Date().getHours() < 12 ? "AM" : "PM",
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
      const newInputs = [...prevInputs];
      newInputs[1].selectValues = [
        ...Array(
          getDaysInMonth(currentYearMonth.year, currentYearMonth.month)
        ).keys(),
      ].map((day) => day + 1);
      return newInputs;
    });
  }, [currentYearMonth]);
  

  const onCloseModal = () => {
    onToggleElementVisibility("scheduleModal");
  };

  const onConfirmSchedule = () => {
    onToggleElementVisibility("scheduleModal");
    setPost({ ...post, schedule });
    console.log(schedule);
  };

  const onClearSchedule = () => {
    onToggleElementVisibility("scheduleModal");
    const { schedule, ...postWithOutSchedule } = post;
    setPost(postWithOutSchedule);
  };

  const getTimeZone = (): string => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timeZoneName = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "long",
      hour: "numeric",
    })
      .formatToParts()
      .find((part) => part.type === "timeZoneName")?.value;

    return timeZoneName ? timeZoneName : "Time Zone Not Found";
  };

  const onGoToUnsentPostsPage = () => {
    navigate("/unsent-posts");
  };

  return (
    <Fragment>
      <div className="main-screen dark-light" onClick={onCloseModal}></div>
      <section className="post-scheduler-modal">
        <header className="post-scheduler-modal-header">
          <div className="post-scheduler-modal-header-close-btn-title-container">
            <div className="btn-close-container">
              <BtnClose onClickBtn={onCloseModal} />
            </div>
            <h3 className="post-scheduler-modal-title">Schedule</h3>
          </div>
          <div className="post-scheduler-modal-header-btns-container">
            {post.schedule && (
              <button className="btn-clear-schedule" onClick={onClearSchedule}>
                <span>Clear</span>
              </button>
            )}
            <button
              className="btn-confirm-schedule"
              onClick={onConfirmSchedule}
            >
              {post.schedule ? "Confirm" : "Update"}
            </button>
          </div>
        </header>
        <main className="post-schedule-modal-main-container">
          <PostDateTitle date={schedule ? schedule : new Date()} />

          <div className="date-inputs">
            <h3 className="date-inputs-title">Date</h3>
            <div className="date-inputs-container">
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
          </div>
          <div className="time-inputs">
            <h3 className="time-inputs-title">Time</h3>
            <div className="time-inputs-container">
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
          </div>
          <div className="time-zone">
            <h3 className="time-zone-title">Time Zone</h3>
            <div className="time-zone-container">
              <p className="time-zone-value">{getTimeZone()}</p>
            </div>
          </div>
        </main>
        <footer className="post-schedule-modal-footer">
          <button
            className="btn-toggle-schedule-chirps-modal"
            onClick={onGoToUnsentPostsPage}
          >
            Schedule Chirps
          </button>
        </footer>
      </section>
    </Fragment>
  );
};
