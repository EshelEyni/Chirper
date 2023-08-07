import { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../../store/types";
import { RootState } from "../../../../store/store";
import { BtnRemoveContent } from "../../../Btns/BtnRemoveContent/BtnRemoveContent";
import { SpinnerLoader } from "../../../Loaders/SpinnerLoader/SpinnerLoader";
import "./PostEditImgList.scss";
import { usePostEdit } from "../../../../contexts/PostEditContext";
import { updateNewPost } from "../../../../store/slices/postEditSlice";

export const PostEditImgList: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.postEdit);
  const { currNewPost } = usePostEdit();
  if (!currNewPost) return null;
  const { imgs } = currNewPost;
  const className = `post-edit-img-list ${imgs.length > 2 ? "grid" : ""} cols-${imgs.length}`;

  function onRemoveImg(idx: number) {
    if (!currNewPost || !currNewPost.imgs) return;
    const newImgs = [...currNewPost.imgs];
    newImgs.splice(idx, 1);
    dispatch(updateNewPost({ newPost: { ...currNewPost, imgs: newImgs }, newPostType }));
  }

  return (
    <section className={className}>
      {imgs.map((img, idx) => (
        <div className={`post-edit-img-container img-${idx + 1}`} key={idx}>
          <BtnRemoveContent onRemoveContent={() => onRemoveImg(idx)} />
          {img.isLoading ? (
            <SpinnerLoader />
          ) : (
            <img className="post-edit-img" src={img.url} alt="post-img" />
          )}
        </div>
      ))}
    </section>
  );
};
