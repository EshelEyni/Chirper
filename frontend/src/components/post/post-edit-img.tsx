import { FC, useRef } from "react";
import { utilService } from "../../services/util.service/utils.service";
import { ContentLoader } from "../loaders/content-loader";
import { BtnRemoveContent } from "../btns/btn-remove-content";
import { AppDispatch } from "../../store/types";
import { useDispatch, useSelector } from "react-redux";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { RootState } from "../../store/store";
import { setNewPost } from "../../store/actions/post.actions";
import { NewPostType } from "../../store/reducers/post.reducer";

export const PostEditImg: FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const {
    newPost,
    sideBarNewPost,
    newPostType,
  }: { newPost: NewPost; sideBarNewPost: NewPost; newPostType: NewPostType } = useSelector(
    (state: RootState) => state.postModule
  );
  const newPostTypeRef = useRef(newPostType);
  const currPost = newPostTypeRef.current === "side-bar-post" ? sideBarNewPost : newPost;

  const onRemoveImg = (idx: number) => {
    if (!currPost.imgs) return;
    const newImgs = [...currPost.imgs];
    newImgs.splice(idx, 1);
    dispatch(setNewPost({ ...currPost, imgs: newImgs }, newPostType));
  };

  return (
    <section
      className={
        "post-edit-imgs" +
        (currPost.imgs.length > 2 ? " grid" : "") +
        ` cols-${currPost.imgs.length}`
      }
    >
      {currPost.imgs.map((img, idx) => (
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
