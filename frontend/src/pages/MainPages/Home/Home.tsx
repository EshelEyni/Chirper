import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { getPosts } from "../../../store/actions/post.actions";
import { AppDispatch } from "../../../store/types";
import "./Home.scss";
import { PostEdit } from "../../../components/Post/PostEdit/PostEdit";
import { PostList } from "../../../components/Post/PostList/PostList";
import { ContentLoader } from "../../../components/Loaders/ContentLoader/ContentLoader";
import { PostEditProvider } from "../../../contexts/PostEditContext";

export const HomePage = () => {
  const { posts } = useSelector((state: RootState) => state.postModule);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    document.title = "Home / Chirper";
    if (!posts.length) dispatch(getPosts());
  }, [posts, dispatch]);

  return (
    <>
      <main className="home">
        <div className="title-container">
          <h1>Home</h1>
        </div>
        <div className="home-main-container">
          <div className="post-edit-container">
            <PostEditProvider>
              <PostEdit isHomePage={true} />
            </PostEditProvider>
          </div>
          <div className="home-page-post-list-container">
            {posts.length > 0 ? <PostList posts={posts} /> : <ContentLoader />}
          </div>
        </div>
        <Outlet />
      </main>
    </>
  );
};
