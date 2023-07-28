import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { NewPost } from "../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../store/store";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { BtnRemoveContent } from "../../Btns/BtnRemoveContent/BtnRemoveContent";
import { ContentLoader } from "../../Loaders/ContentLoader/ContentLoader";
import "./PostEditImgList.scss";

type PostEditImgProps = {
  currNewPost: NewPost;
};

export const PostEditImgList: FC<PostEditImgProps> = ({ currNewPost }) => {
  const { imgs } = currNewPost;
  const className = `post-edit-img-list ${imgs.length > 2 ? "grid" : ""} cols-${imgs.length}`;

  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  function onRemoveImg(idx: number) {
    if (!currNewPost.imgs) return;
    const newImgs = [...currNewPost.imgs];
    newImgs.splice(idx, 1);
    dispatch(updateCurrNewPost({ ...currNewPost, imgs: newImgs }, newPostType));
  }

  return (
    <section className={className}>
      {imgs.map((img, idx) => (
        <div className={`post-edit-img-container img-${idx + 1}`} key={idx}>
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
