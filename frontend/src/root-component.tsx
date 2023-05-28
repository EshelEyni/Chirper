import { SideBar } from "./components/side-bar/side-bar";
import { Routes, Route } from "react-router-dom";
import { routes, nestedRoutes } from "./routes";
import "./styles/main.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { UserMsg } from "./components/msg/user-msg";
import { LoginSignupMsg } from "./components/msg/login-signup-msg";
import { AppDispatch } from "./store/types";
import { autoLogin } from "./store/actions/auth.actions";

function RootComponent() {
  const dispatch: AppDispatch = useDispatch();
  const { isSideBarShown, userMsg } = useSelector((state: RootState) => state.systemModule);
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);

  if (!loggedinUser) dispatch(autoLogin());

  return (
    <div className="app">
      <div className="app-content">
        {isSideBarShown && <SideBar />}
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={<route.component />}>
              {nestedRoutes
                .map((nestedRoute, index) => {
                  if (nestedRoute.onlyHomePage && route.path !== "") {
                    return null;
                  }
                  return (
                    <Route
                      key={index}
                      path={nestedRoute.path}
                      element={<nestedRoute.component />}
                    />
                  );
                })
                .filter(_ => _ !== null)}
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
