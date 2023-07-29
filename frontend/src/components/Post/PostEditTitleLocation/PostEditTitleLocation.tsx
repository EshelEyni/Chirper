import { FC } from "react";
import { IoLocationSharp } from "react-icons/io5";
import { usePostEdit } from "../PostEdit/PostEditContext";
import { useNavigate } from "react-router-dom";
type PostEditTitleLocationProps = {
  title: string;
};
export const PostEditTitleLocation: FC<PostEditTitleLocationProps> = ({ title }) => {
  const { isPickerShown } = usePostEdit();
  const navigate = useNavigate();

  function onGoToLocationPage() {
    if (!isPickerShown) return;
    navigate("post-location", { relative: "path" });
  }

  return (
    <div className="post-edit-location-title" onClick={onGoToLocationPage}>
      <IoLocationSharp /> {title}
    </div>
  );
};
