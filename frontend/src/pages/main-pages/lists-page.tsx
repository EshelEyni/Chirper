import { Outlet } from "react-router-dom";

export const ListsPage = () => {
  return (
    <main className="lists">
      <div className="title-container">
        <h1>Lists</h1>
      </div>

      <Outlet />
    </main>
  );
};
