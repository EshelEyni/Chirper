import { FC } from "react";
import { IoLocationSharp } from "react-icons/io5";
type PostEditTitleLocationProps = {
  title: string;
  onGoToLocationPage: () => void;
};
export const PostEditTitleLocation: FC<PostEditTitleLocationProps> = ({
  title,
  onGoToLocationPage,
}) => {
  return (
    <div className="post-edit-location-title" onClick={onGoToLocationPage}>
      <IoLocationSharp /> {title}
    </div>
  );
};
