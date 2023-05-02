import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AppDispatch } from "../../store/types";
import { useNavigate } from "react-router-dom";
import { useState, Fragment } from "react";
import { BtnClose } from "../../components/btns/btn-close";
import { setNewPost } from "../../store/actions/post.actions";
import { LocationSearch } from "../../components/other/location-search-bar";

export const PostLocation = () => {
  const { newPost } = useSelector((state: RootState) => state.postModule);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [location, setLocation] = useState<string>("");

  const onGoBack = () => {
    navigate("");
  };

  const onConfirmLocation = () => {
    navigate("");
    dispatch(setNewPost({ ...newPost, location }));
  };

  const onClearLocation = () => {
    navigate("");
    const { location, ...postWithOutLocation } = newPost;
    dispatch(setNewPost(postWithOutLocation));
  };

  return (
    <Fragment>
      <div className="main-screen dark-light" onClick={onGoBack}></div>
      <section className="post-location">
        <header className="post-location-header">
          <div className="post-location-header-close-btn-title-container">
            <div className="btn-close-container">
              <BtnClose onClickBtn={onGoBack} />
            </div>
            <h3 className="post-location-title">Tag location</h3>
          </div>
          <div className="post-location-header-btns-container">
            {newPost.location && (
              <button className="btn-clear-location" onClick={onClearLocation}>
                <span>Clear</span>
              </button>
            )}
            <button className={"btn-confirm-location"} onClick={onConfirmLocation}>
              Done
            </button>
          </div>
        </header>
        <main className="post-location-main-container"></main>
        <LocationSearch/>
      </section>
    </Fragment>
  );
};
