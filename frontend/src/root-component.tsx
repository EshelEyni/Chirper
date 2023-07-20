import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { routes, nestedRoutes } from "./routes";
import { AppDispatch } from "./store/types";
import "./styles/main.scss";
import { autoLogin } from "./store/actions/auth.actions";
import { RootState } from "./store/store";
import { SideBar } from "./components/SideBar/SideBar";
import { UserMsg } from "../src/components/Msg/UserMsg/UserMsg";
import { LoginSignupMsg } from "../src/components/Msg/LoginSignupMsg/LoginSignupMsg";

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
