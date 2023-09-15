import { FC } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { removeNewPost } from "../../../store/slices/postEditSlice";
import { AppDispatch, RootState } from "../../../types/app";

export const BtnRemovePostFromThread: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.postEdit);

  return (
    <button className="btn-remove-post-from-thread">
      <AiOutlineClose
        color="var(--color-primary)"
        size={15}
        onClick={() => dispatch(removeNewPost(newPostType))}
      />
    </button>
  );
};
