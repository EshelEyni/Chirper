import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SpinnerLoader } from "../../../components/Loaders/SpinnerLoader/SpinnerLoader";
import { PostEditProvider } from "../../../contexts/PostEditContext";
import { useScrollRedirect } from "../../../hooks/app/useScrollRedirect";
import { usePageLoaded } from "../../../hooks/app/usePageLoaded";
import "./Home.scss";
import { AsyncList } from "../../../components/App/AsyncList/AsyncList";
import { Post } from "../../../../../shared/interfaces/post.interface";
import { PostPreviewProvider } from "../../../contexts/PostPreviewContext";
import { PostPreview } from "../../../components/Post/PostPreview/PostPreview/PostPreview";
import { useQueryPosts } from "../../../hooks/reactQuery/post/useQueryPost";
// import { useQueryPosts } from "../../../hooks/reactQuery/post/useQueryPost";
const PostEdit = lazy(() => import("../../../components/Post/PostEdit/PostEdit"));

const Homepage = () => {
  usePageLoaded({ title: "Home / Chirper" });
  const { scrollTargetRef } = useScrollRedirect();
  const { posts, isLoading, isSuccess, isError, isEmpty } = useQueryPosts();

  return (
    <main className="home">
      <div className="title-container">
        <h1>Home</h1>
      </div>
      <div className="home-main-container" ref={scrollTargetRef}>
        <div className="post-edit-container">
          <PostEditProvider isHomePage={true}>
            <Suspense
              fallback={<SpinnerLoader withContainer={true} containerSize={{ height: "100px" }} />}
            >
              <PostEdit isHomePage={true} />
            </Suspense>
          </PostEditProvider>
        </div>

        <AsyncList
          render={(post: Post) => (
            <PostPreviewProvider post={post} key={`${post.id}-${post.createdAt}`}>
              <PostPreview />
            </PostPreviewProvider>
          )}
          items={posts as Post[]}
          isLoading={isLoading}
          isSuccess={isSuccess}
          isError={isError}
          isEmpty={isEmpty}
          entityName={"posts"}
        />
      </div>
      <Suspense fallback={<SpinnerLoader />}>
        <Outlet />
      </Suspense>
    </main>
  );
};

export default Homepage;

// Path: src/pages/MainPages/Home/Home.tsx
