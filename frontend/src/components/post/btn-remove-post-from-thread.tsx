import { FC } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { AppDispatch } from "../../store/types";
import { useDispatch } from "react-redux";
import { removeNewPostFromThread } from "../../store/actions/new-post.actions";
import { NewPostType as typeofPostType } from "../../store//reducers/new-post.reducer";

type BtnRemovePostFromThreadProps = {
  newPostType: typeofPostType;
};

export const BtnRemovePostFromThread: FC<BtnRemovePostFromThreadProps> = ({ newPostType }) => {
  const dispatch: AppDispatch = useDispatch();

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
