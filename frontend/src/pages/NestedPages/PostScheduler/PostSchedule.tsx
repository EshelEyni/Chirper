import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import "./PostSchedule.scss";
import { PostDateTitle } from "../../../components/Post/PostDateTitle/PostDateTitle";
import { MainScreen } from "../../../components/App/MainScreen/MainScreen";
import { PostScheduleHeader } from "./Header/PostScheduleHeader";
import { PostScheduleDateInputs } from "./DateInputs/PostScheduleDateInputs";
import { PostScheduleTimeInputs } from "./TimeInputs/PostScheduleTimeInputs";
import { TimeZoneDisplay } from "./TimeZoneDisplay/TimeZoneDisplay";
import { Footer } from "../../../components/App/Footer/Footer";

export type invalidDateStatus = {
  status: boolean;
  location: "date" | "time" | "";
};

export const PostSchedule = () => {
  const navigate = useNavigate();
  const { homePage, sideBar, newPostType } = useSelector((state: RootState) => state.newPostModule);
  const currNewPost =
    newPostType === "home-page"
      ? homePage.posts[homePage.currPostIdx]
      : sideBar.posts[sideBar.currPostIdx];

  const [schedule, setSchedule] = useState<Date>(getScheduleDate());
  const [isDateInvalid, setIsDateInvalid] = useState<invalidDateStatus>({
    status: false,
    location: "",
  });

  const isDateTitleShown = !isDateInvalid.status && currNewPost.schedule;

  function getScheduleDate() {
    const defaultNewDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    return currNewPost.schedule ? new Date(currNewPost.schedule) : defaultNewDate;
  }

  function getErrorLocation(newDate: Date): "time" | "date" {
    const newMonth = newDate.getMonth();
    const newDay = newDate.getDate();
    const currDate = new Date();
    const currMonth = currDate.getMonth();
    const currDay = currDate.getDate();
    if (newMonth === currMonth && newDay === currDay) return "time";
    return "date";
  }

  function onGoBack() {
    navigate("/home");
  }

  function onGoToUnsentPostsPage() {
    navigate("/unsent-posts");
  }

  return (
    <>
      <MainScreen onClickFn={onGoBack} mode="light" />
      <section className="post-schedule">
        <PostScheduleHeader
          currNewPost={currNewPost}
          schedule={schedule}
          onGoBack={onGoBack}
          isDateInvalid={isDateInvalid}
        />
        <main className="post-schedule-main-container">
          {isDateTitleShown && <PostDateTitle date={currNewPost.schedule!} />}
          <PostScheduleDateInputs
            schedule={schedule}
            setSchedule={setSchedule}
            setIsDateInvalid={setIsDateInvalid}
            getErrorLocation={getErrorLocation}
            isDateInvalid={isDateInvalid.location === "date"}
          />
          <PostScheduleTimeInputs
            schedule={schedule}
            setSchedule={setSchedule}
            setIsDateInvalid={setIsDateInvalid}
            getErrorLocation={getErrorLocation}
            isDateInvalid={isDateInvalid.location === "time"}
          />
          <TimeZoneDisplay />
        </main>
        <Footer className="post-schedule-footer">
          <button className="btn-go-to-unsent-chirp" onClick={onGoToUnsentPostsPage}>
            Schedule Chirps
          </button>
        </Footer>
      </section>
    </>
  );
};
