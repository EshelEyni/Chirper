import { FC } from "react";
import { PostEditActionBtn as TypeOfPostEditActionBtn } from "../PostEditActions/PostEditActions";

type PostEditActionBtnProps = {
  btn: TypeOfPostEditActionBtn;
};
export const PostEditActionBtn: FC<PostEditActionBtnProps> = ({ btn }) => {
  return (
    <button
      disabled={btn.isDisabled}
      className={"post-edit-action-btn" + (btn.isDisabled ? " disabled" : "")}
      onClick={btn.onClickFn}
    >
      <div className="post-edit-action-icon-container">{btn.icon}</div>
    </button>
  );
};
