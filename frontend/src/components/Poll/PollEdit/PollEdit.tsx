import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { NewPost } from "../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../store/store";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { PollOptionsList } from "../PollOptionsList/PollOptionsList";
import { PollLengthInputs } from "../PollLengthInputs/PollLengthInputs";
import "./PollEdit.scss";

type PollEditProps = {
  currNewPost: NewPost;
};
export const PollEdit: FC<PollEditProps> = ({ currNewPost }) => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  function onRemovePoll() {
    dispatch(updateCurrNewPost({ ...currNewPost, poll: null }, newPostType));
  }

  return (
    <div className="poll-edit">
      <PollOptionsList currNewPost={currNewPost} />
      <PollLengthInputs currNewPost={currNewPost} />
      <button className="btn-remove-poll" onClick={onRemovePoll}>
        Remove poll
      </button>
    </div>
  );
};
