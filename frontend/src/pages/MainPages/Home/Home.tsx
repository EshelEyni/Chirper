import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SpinnerLoader } from "../../../components/Loaders/SpinnerLoader/SpinnerLoader";
import { PostEditProvider } from "../../../contexts/PostEditContext";
import { PostListContainer } from "../../../components/Post/PostListContainer/PostListContainer";
import { useDocumentTitle } from "../../../hooks/app/useDocumentTitle";
import "./Home.scss";
import { useScrollRedirect } from "../../../hooks/app/useScrollRedirect";
const PostEdit = lazy(() => import("../../../components/Post/PostEdit/PostEdit"));

const Homepage = () => {
  useDocumentTitle("Home / Chirper");
  const { scrollTargetRef } = useScrollRedirect();

  return (
    <main className="home">
      <div className="title-container">
        <h1>Home</h1>
      </div>
      <div className="home-main-container" ref={scrollTargetRef}>
        <div className="post-edit-container">
          <PostEditProvider isHomePage={true}>
            <Suspense fallback={<SpinnerLoader />}>
              <PostEdit isHomePage={true} />
            </Suspense>
          </PostEditProvider>
        </div>
        <PostListContainer />
      </div>
      <Suspense fallback={<SpinnerLoader />}>
        <Outlet />
      </Suspense>
    </main>
  );
};

export default Homepage;

// Path: src/pages/MainPages/Home/Home.tsx
