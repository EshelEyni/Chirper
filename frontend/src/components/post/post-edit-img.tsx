import { FC } from "react";
import { utilService } from "../../services/util.service/utils.service";
import { ContentLoader } from "../loaders/content-loader";
import { BtnRemoveContent } from "../btns/btn-remove-content";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { RootState } from "../../store/store";
import { setNewPost } from "../../store/actions/post.actions";

export const PostEditImg: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { newPost }: { newPost: NewPost } = useSelector((state: RootState) => state.postModule);

  const onRemoveImg = (idx: number) => {
    if (!newPost.imgs) return;
    const newImgs = [...newPost.imgs];
    newImgs.splice(idx, 1);
    dispatch(setNewPost({ ...newPost, imgs: newImgs }));
  };

  return (
    <section
      className={
        "post-edit-imgs" + (newPost.imgs.length > 2 ? " grid" : "") + ` cols-${newPost.imgs.length}`
      }
    >
      {newPost.imgs.map((img, idx) => (
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
