import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { routes, nestedRoutes } from "./routes";
import { AppDispatch } from "./store/types";
import "./styles/main.scss";
import { autoLogin } from "./store/actions/auth.actions";
import { RootState } from "./store/store";
import { SideBar } from "./components/SideBar/SideBar";
import { UserMsg } from "../src/components/Msg/UserMsg/UserMsg";
import { LoginSignupMsg } from "../src/components/Msg/LoginSignupMsg/LoginSignupMsg";
import { Route as TypeOfRoute } from "./routes";
import { PageNotFound } from "./pages/MainPages/PageNotFound/PageNotFound";

function RootComponent() {
  const dispatch: AppDispatch = useDispatch();
  const { isSideBarShown, userMsg } = useSelector((state: RootState) => state.systemModule);
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  if (!loggedinUser) dispatch(autoLogin());

  function getRoutes() {
    return routes.map(route => (
      <Route key={route.path} path={route.path} element={<route.component />}>
        {getNestedRoutes(route)}
      </Route>
    ));
  }

  function getNestedRoutes(route: TypeOfRoute) {
    const isHomePage = route.path === "home";
    const filteredNestedRoutes = nestedRoutes.filter(route => isHomePage && route.onlyHomePage);

    if (isHomePage)
      return nestedRoutes.map(route => (
        <Route key={route.path} path={route.path} element={<route.component />} />
      ));

    return filteredNestedRoutes.map(route => (
      <Route key={route.path} path={route.path} element={<route.component />} />
    ));
  }

  return (
    <div className="app">
      <div className="app-content">
        {isSideBarShown && <SideBar />}
        <Routes>
          <Route index element={<Navigate replace to="/home" />} />
          {getRoutes()}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        {!loggedinUser && <LoginSignupMsg />}
        {userMsg && <UserMsg />}
      </div>
    </div>
  );
}

export default RootComponent;
