import { FC } from "react";
import { BtnClose } from "../../components/Btns/BtnClose/BtnClose";
import { NewPost } from "../../../../shared/types/post";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { updateNewPost } from "../../store/slices/postEditSlice";
import "./PostScheduleHeader.scss";

type PostScheduleHeaderProps = {
  currNewPost: NewPost;
  schedule: Date;
  onGoBack: () => void;
  isDateInvalid: {
    status: boolean;
    location: string;
  };
};

export const PostScheduleHeader: FC<PostScheduleHeaderProps> = ({
  currNewPost,
  schedule,
  onGoBack,
  isDateInvalid,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.postEdit);

  function onConfirmSchedule() {
    onGoBack();
    const newPost = { ...currNewPost, schedule };
    dispatch(updateNewPost({ newPost, newPostType }));
  }

  function onClearSchedule() {
    onGoBack();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schedule, ...postWithOutSchedule } = currNewPost;
    dispatch(updateNewPost({ newPost: postWithOutSchedule, newPostType }));
  }

  return (
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
  );
};
