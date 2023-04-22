import { FiImage, FiList } from "react-icons/fi";
import { RiFileGifLine } from "react-icons/ri";
import { CiCalendarDate } from "react-icons/ci";
import { BsEmojiSmile } from "react-icons/bs";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/types";
import { setUserMsg } from "../../store/actions/system.actions";
import { useEffect, useState } from "react";

interface PostEditActionBtnsProps {
  imgUrls: { url: string; isLoading: boolean }[];
  setImgUrls: (urls: { url: string; isLoading: boolean }[]) => void;
}

export const PostEditActionBtns: React.FC<PostEditActionBtnsProps> = ({
  imgUrls,
  setImgUrls,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const [isMultiple, setIsMultiple] = useState(true);

  useEffect(() => {
    if (imgUrls.length < 3) setIsMultiple(true);
    else setIsMultiple(false);
  }, [imgUrls]);

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

  const readAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file."));
        }
      };
      reader.readAsDataURL(file);
    });

  const onUploadImgs = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = ev.target;
    if (!files) return;

    let newImgUrls = [...imgUrls];

    const msg = "Please choose either 1 GIF or up to 4 photos.";
    if (files.length > 4 || files.length + imgUrls.length > 4) {
      dispatch(setUserMsg(msg));
      return;
    }

    for (let i = 0; i < files.length; i++) {
      try {
        const file = files[i];

        if (file) {
          const currIdx = newImgUrls.length;
          newImgUrls.push({ url: "", isLoading: true });
          setImgUrls([...newImgUrls]);

          const dataUrl = await readAsDataURL(file);
          newImgUrls[currIdx] = { url: dataUrl, isLoading: false };
          setImgUrls([...newImgUrls]);
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  };

  return (
    <div className="post-edit-action-btns">
      {btns.map((btn, idx) => {
        if (btn.name === "img-upload") {
          return (
            <div
              key={idx}
              className={
                "post-edit-action-btn-container" +
                (imgUrls.length === 4 ? " disabled" : "")
              }
            >
              <label htmlFor={btn.name} className="post-edit-action-btn">
                {btn.icon}
              </label>
              <input
                type={btn.type}
                multiple={isMultiple}
                disabled={imgUrls.length === 4}
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
