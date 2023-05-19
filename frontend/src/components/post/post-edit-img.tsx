import { utilService } from "../../services/util.service/utils.service";
import { ContentLoader } from "../loaders/content-loader";
import { BtnRemoveContent } from "../btns/btn-remove-content";

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
          <BtnRemoveContent onRemoveContent={() => onRemoveImg(idx)} />
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
