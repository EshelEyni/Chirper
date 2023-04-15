import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { PostEdit } from "../components/post/post-edit";
import { TextIndicator } from "../components/other/text-indicator";

export const HomePage = () => {
  useEffect(() => {
    document.title = "Home • Chirper";
  }, []);

  return (
    <main className="home">
      <div className="title-container">
        <h1>Home</h1>
      </div>
      <div className="post-edit-container">
        <PostEdit isHomePage={true} />
      </div>
      <Outlet />
    </main>
  );
};
