import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { RootState } from "../../../store/store";
import { PollOptionsList } from "../PollOptionsList/PollOptionsList";
import { PollLengthInputs } from "./PollLengthInputs/PollLengthInputs";
import "./PollEdit.scss";
import { usePostEdit } from "../../../contexts/PostEditContext";
import { updateNewPost } from "../../../store/slices/postEditSlice";

export const PollEdit: FC = () => {
  const { currNewPost } = usePostEdit();
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.postEdit);

  function onRemovePoll() {
    if (!currNewPost) return;
    dispatch(updateNewPost({ newPost: { ...currNewPost, poll: null }, newPostType }));
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
