import { utilService } from "../../services/util.service/utils.service";
import { AiOutlineClose } from "react-icons/ai";
import { ContentLoader } from "../loaders/content-loader";

interface PostEditImgProps {
  imgs: { url: string; isLoading: boolean; file: File }[];
  setImgs: (urls: { url: string; isLoading: boolean; file: File }[]) => void;
}

export const PostEditImg: React.FC<PostEditImgProps> = ({ imgs, setImgs }) => {
  const onRemoveImg = (idx: number) => {
    const newImgs = [...imgs];
    newImgs.splice(idx, 1);
    setImgs(newImgs);
  };

  return (
    <section
      className={"post-edit-imgs" + (imgs.length > 2 ? " grid" : "") + ` cols-${imgs.length}`}
    >
      {imgs.map((img, idx) => (
        <div className={"post-edit-img-container" + ` img-${idx + 1}`} key={utilService.makeKey()}>
          <button className="btn-remove-content" onClick={() => onRemoveImg(idx)}>
            <AiOutlineClose className="remove-content-icon" />
          </button>
          {img.isLoading ? (
            <ContentLoader />
          ) : (
            <img className="post-edit-img" src={img.url} alt="post-img" />
          )}
        </div>
      ))}
    </section>
  );
};
