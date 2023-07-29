import { FC } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { AppDispatch } from "../../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { removeNewPostFromThread } from "../../../store/actions/new-post.actions";
import { RootState } from "../../../store/store";

export const BtnRemovePostFromThread: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  return (
    <button className="btn-remove-post-from-thread">
      <AiOutlineClose
        color="var(--color-primary)"
        size={15}
        onClick={() => dispatch(removeNewPostFromThread(newPostType))}
      />
    </button>
  );
};
