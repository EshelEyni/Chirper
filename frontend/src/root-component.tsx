import { SideBar } from "./components/side-bar/side-bar";
import { Routes, Route, useLocation } from "react-router-dom";
import { routes, nestedRoutes } from "./routes";
import "./styles/main.scss";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { UserMsg } from "./components/msg/user-msg";
import { PostSchedule } from "./pages/secondary-pages/post-scheduler";
import { PostLocation } from "./pages/secondary-pages/post-location";
import { LoginSignupMsg } from "./components/msg/login-signup-msg";

function RootComponent() {
  const { isSideBarShown, userMsg } = useSelector((state: RootState) => state.systemModule);
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const location = useLocation();

  return (
    <div className="app">
      <div className="app-content">
        {isSideBarShown && <SideBar />}
        {location.pathname === "/post-schedule" && <PostSchedule />}
        {location.pathname === "/post-location" && <PostLocation />}
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={<route.component />}>
              {nestedRoutes.map((nestedRoute, index) => (
                <Route key={index} path={nestedRoute.path} element={<nestedRoute.component />} />
              ))}
            </Route>
          ))}
        </Routes>
        {!loggedinUser && <LoginSignupMsg />}
        {userMsg && <UserMsg />}
      </div>
    </div>
  );
}

export default RootComponent;
