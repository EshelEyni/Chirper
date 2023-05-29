import { FC } from "react";
import { utilService } from "../../services/util.service/utils.service";
import { ContentLoader } from "../loaders/content-loader";
import { BtnRemoveContent } from "../btns/btn-remove-content";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { RootState } from "../../store/store";
import { updateCurrNewPost } from "../../store/actions/post.actions";

type PostEditImgProps = {
  currNewPost: NewPost;
};

export const PostEditImg: FC<PostEditImgProps> = ({ currNewPost }) => {
  const dispatch: AppDispatch = useDispatch();
  const { newPostType } = useSelector((state: RootState) => state.postModule.newPostState);

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
        <div className={"post-edit-img-container" + ` img-${idx + 1}`} key={utilService.makeId()}>
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
