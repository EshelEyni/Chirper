import { FC } from "react";
import { IoLocationSharp } from "react-icons/io5";
import { usePostEdit } from "../PostEdit/PostEditContext";
import { useNavigate } from "react-router-dom";

export const PostEditTitleLocation: FC = () => {
  const navigate = useNavigate();
  const { isPickerShown, currNewPost } = usePostEdit();
  if (!currNewPost || !currNewPost.location) return null;
  const title = currNewPost?.location.name;

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
