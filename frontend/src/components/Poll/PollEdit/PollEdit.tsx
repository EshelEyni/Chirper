import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { RootState } from "../../../store/store";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { PollOptionsList } from "../PollOptionsList/PollOptionsList";
import { PollLengthInputs } from "./PollLengthInputs/PollLengthInputs";
import "./PollEdit.scss";
import { usePostEdit } from "../../../contexts/PostEditContext";

export const PollEdit: FC = () => {
  const { currNewPost } = usePostEdit();
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  function onRemovePoll() {
    if (!currNewPost) return;
    dispatch(updateCurrNewPost({ ...currNewPost, poll: null }, newPostType));
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
