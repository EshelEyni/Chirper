import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../store/types";
import { NewPost } from "../../../../../shared/interfaces/post.interface";
import { RootState } from "../../../store/store";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { makeId } from "../../../services/util/utils.service";
import "./PostEditImg.scss";
import { BtnRemoveContent } from "../../Btns/BtnRemoveContent/BtnRemoveContent";
import { ContentLoader } from "../../Loaders/ContentLoader/ContentLoader";

type PostEditImgProps = {
  currNewPost: NewPost;
};

export const PostEditImg: FC<PostEditImgProps> = ({ currNewPost }) => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  const onRemoveImg = (idx: number) => {
    if (!currNewPost.imgs) return;
    const newImgs = [...currNewPost.imgs];
    newImgs.splice(idx, 1);
    dispatch(updateCurrNewPost({ ...currNewPost, imgs: newImgs }, newPostType));
  };

  return (
    <section
      className={
        "post-edit-imgs" +
        (currNewPost.imgs.length > 2 ? " grid" : "") +
        ` cols-${currNewPost.imgs.length}`
      }
    >
      {currNewPost.imgs.map((img, idx) => (
        <div className={"post-edit-img-container" + ` img-${idx + 1}`} key={makeId()}>
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
