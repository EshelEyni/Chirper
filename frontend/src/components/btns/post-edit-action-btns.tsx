import { FiImage,FiList } from "react-icons/fi";
import { RiFileGifLine } from "react-icons/ri";
import { CiCalendarDate } from "react-icons/ci";
import { BsEmojiSmile } from "react-icons/bs";
import { HiOutlineLocationMarker } from "react-icons/hi";

export const PostEditActionBtns = () => {
  const btnIcons = [
    <FiImage />,
    <RiFileGifLine />,
    <FiList />,
    <BsEmojiSmile />,
    <CiCalendarDate />,
    <HiOutlineLocationMarker />,
  ];
  return (
    <div className="post-edit-action-btns">
      {btnIcons.map((icon, idx) => (
        <button key={idx} className="btn-icon">
          {icon}
        </button>
      ))}
    </div>
  );
};
