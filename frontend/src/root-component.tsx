import { SideBar } from "./components/side-bar/side-bar";
import { Routes, Route, useLocation } from "react-router-dom";
import { routes, nestedRoutes } from "./routes";
import "./styles/main.scss";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { UserMsg } from "./components/other/user-msg";
import { PostScheduler } from "./pages/post-scheduler";

function RootComponent() {
  const { isSideBarShown, userMsg } = useSelector((state: RootState) => state.systemModule);
  const location = useLocation();

  const isPostScheduleRoute = location.pathname === "/post-schedule";
  return (
    <div className="app">
      <div className="app-content">
        {isSideBarShown && <SideBar />}
        {isPostScheduleRoute && <PostScheduler />}
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={<route.component />}>
              {nestedRoutes.map((nestedRoute, index) => (
                <Route key={index} path={nestedRoute.path} element={<nestedRoute.component />} />
              ))}
            </Route>
          ))}
        </Routes>
        {userMsg && <UserMsg />}
      </div>
    </div>
  );
}

export default RootComponent;
