import { FC } from "react";
import { BtnClose } from "../../../../components/Btns/BtnClose/BtnClose";
import "./PostScheduleHeader.scss";
import { NewPost } from "../../../../../../shared/interfaces/post.interface";
import { AppDispatch } from "../../../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { updateCurrNewPost } from "../../../../store/actions/new-post.actions";

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
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  function onConfirmSchedule() {
    onGoBack();
    const newPost = { ...currNewPost, schedule };
    dispatch(updateCurrNewPost(newPost, newPostType));
  }

  function onClearSchedule() {
    onGoBack();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schedule, ...postWithOutSchedule } = currNewPost;
    dispatch(updateCurrNewPost(postWithOutSchedule, newPostType));
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
