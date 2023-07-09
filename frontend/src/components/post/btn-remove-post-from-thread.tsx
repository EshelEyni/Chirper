import { FC } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { AppDispatch } from "../../store/types";
import { useDispatch } from "react-redux";
import { removeNewPostFromThread } from "../../store/actions/new-post.actions";

type BtnRemovePostFromThreadProps = {
  newPostType: "reply" | "quote" | "side-bar" | "home-page";
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
