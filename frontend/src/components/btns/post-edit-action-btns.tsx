import { FiImage, FiList } from "react-icons/fi";
import { RiFileGifLine } from "react-icons/ri";
import { CiCalendarDate } from "react-icons/ci";
import { BsEmojiSmile } from "react-icons/bs";
import { HiOutlineLocationMarker } from "react-icons/hi";

interface PostEditActionBtnsProps {
  imgUrls: string[];
  setImgUrls: (urls: string[]) => void;
}

export const PostEditActionBtns: React.FC<PostEditActionBtnsProps> = ({
  imgUrls,
  setImgUrls,
}) => {
  const btns = [
    {
      name: "img-upload",
      icon: <FiImage />,
      type: "file",
    },
    {
      name: "gif-upload",
      icon: <RiFileGifLine />,
    },
    {
      name: "poll",
      icon: <FiList />,
    },
    {
      name: "emoji",
      icon: <BsEmojiSmile />,
    },
    {
      name: "schedule",
      icon: <CiCalendarDate />,
    },
    {
      name: "location",
      icon: <HiOutlineLocationMarker />,
    },
  ];

  const onUploadImgs = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = ev.target;
    if (!files) return;

    let newImgUrls = [...imgUrls];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (newImgUrls.length >= 4) break;

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === "string") {
            newImgUrls.push(reader.result);

            if (i === files.length - 1 || newImgUrls.length === 4) {
              setImgUrls([...newImgUrls]);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="post-edit-action-btns">
      {btns.map((btn, idx) => {
        if (btn.name === "img-upload") {
          return (
            <div key={idx} className="post-edit-action-btn-container">
              <label htmlFor={btn.name} className="post-edit-action-btn">
                {btn.icon}
              </label>
              <input
                type={btn.type}
                multiple={true}
                id={btn.name}
                onChange={onUploadImgs}
                style={{ display: "none" }}
              />
            </div>
          );
        } else {
          return (
            <div key={idx} className="post-edit-action-btn-container">
              <button className="post-edit-action-btn">{btn.icon}</button>
            </div>
          );
        }
      })}
    </div>
  );
};
