import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { PostEdit } from "../components/post/post-edit";
import { TextIndicator } from "../components/other/text-indicator";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { getPosts } from "../store/actions/post.actions";
import { PostList } from "../components/post/post-list";
import { AppDispatch } from "../store/types";
import { setIsPageLoading } from "../store/actions/system.actions";
import { PageLoader } from "../components/loaders/page-loader";

export const HomePage = () => {
  const { isPageLoading } = useSelector(
    (state: RootState) => state.systemModule
  );
  const { posts } = useSelector((state: RootState) => state.postModule);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    document.title = "Home • Chirper";
    console.log("Home page loaded");
    console.log(posts);
    if (!posts.length) dispatch(getPosts());
    else dispatch(setIsPageLoading(false));
  }, [posts]);

  return (
    <React.Fragment>
      {isPageLoading && <PageLoader />}
      {(!isPageLoading ) && (
        <main className="home">
          <div className="title-container">
            <h1>Home</h1>
          </div>
          <div className="main-container">
            <div className="post-edit-container">
              <PostEdit isHomePage={true} />
            </div>
            <PostList posts={posts} />
          </div>
          <Outlet />
        </main>
      )}
    </React.Fragment>
  );
};
