import { utilService } from "../../services/util.service/utils.service";
import { AiOutlineClose } from "react-icons/ai";
import { ContentLoader } from "../loaders/content-loader";

interface PostEditImgProps {
  imgUrls: { url: string; isLoading: boolean }[];
  setImgUrls: (urls: { url: string; isLoading: boolean }[]) => void;
}

export const PostEditImg: React.FC<PostEditImgProps> = ({
  imgUrls,
  setImgUrls,
}) => {
  const onRemoveImg = (idx: number) => {
    const newImgUrls = [...imgUrls];
    newImgUrls.splice(idx, 1);
    setImgUrls(newImgUrls);
  };

  return (
    <div
      className={
        "post-edit-imgs-container" +
        (imgUrls.length > 2 ? " grid" : "") +
        ` cols-${imgUrls.length}`
      }
    >
      {imgUrls.map((imgUrl, idx) => (
        <div
          className={"post-edit-img-container" + ` img-${idx + 1}`}
          key={utilService.makeKey()}
        >
          <button className="btn-remove-img" onClick={() => onRemoveImg(idx)}>
            <AiOutlineClose className="remove-img-icon" />
          </button>
          {imgUrl.isLoading ? (
            <ContentLoader />
          ) : (
            <img className="post-edit-img" src={imgUrl.url} alt="post-img" />
          )}
        </div>
      ))}
    </div>
  );
};
