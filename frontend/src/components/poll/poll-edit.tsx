import { FC, useRef } from "react";
import { PollOptionsInput } from "./poll-options-input";
import { PollLengthInputs } from "./poll-length-inputs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store/types";
import { setNewPost } from "../../store/actions/post.actions";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { RootState } from "../../store/store";
import { NewPostType } from "../../store/reducers/post.reducer";

export const PollEdit: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const {
    newPost,
    sideBarNewPost,
    newPostType,
  }: { newPost: NewPost; sideBarNewPost: NewPost; newPostType: NewPostType } = useSelector(
    (state: RootState) => state.postModule
  );

  const newPostTypeRef = useRef(newPostType);
  const currPost = newPostTypeRef.current === "side-bar-post" ? sideBarNewPost : newPost;

  const onRemovePoll = () => {
    dispatch(setNewPost({ ...currPost, poll: null }, newPostType));
  };

  return (
    <div className="poll-edit">
      <PollOptionsInput />
      <PollLengthInputs />
      <button className="btn-remove-poll" onClick={onRemovePoll}>
        Remove poll
      </button>
    </div>
  );
};
