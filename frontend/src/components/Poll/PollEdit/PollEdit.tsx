import { FC } from "react";
import { useDispatch } from "react-redux";
import { PollOptionsList } from "./PollEditOptionsList";
import { PollLengthInputs } from "./PollLengthInputs";
import "./PollEdit.scss";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { updateNewPost } from "../../../store/slices/postEditSlice";
import { AppDispatch } from "../../../types/app";

export const PollEdit: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { currNewPost } = usePostEdit();

  function onRemovePoll() {
    if (!currNewPost) return;
    dispatch(updateNewPost({ newPost: { ...currNewPost, poll: null } }));
  }

  return (
    <div className="poll-edit">
      <PollOptionsList />
      <PollLengthInputs />
      <button className="btn-remove-poll" onClick={onRemovePoll}>
        Remove poll
      </button>
    </div>
  );
};
