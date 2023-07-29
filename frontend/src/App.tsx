import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { routes, nestedRoutes } from "./routes";
import { AppDispatch } from "./store/types";
import "./styles/main.scss";
import { autoLogin } from "./store/actions/auth.actions";
import { RootState } from "./store/store";
import { SideBar } from "./components/SideBar/SideBar";
import { UserMsg } from "./components/Msg/UserMsg/UserMsg";
import { LoginSignupMsg } from "./components/Msg/LoginSignupMsg/LoginSignupMsg";
import { Route as TypeOfRoute } from "./routes";
import { PageNotFound } from "./pages/MainPages/PageNotFound/PageNotFound";
import { useEffect } from "react";
import { PageLoader } from "./components/Loaders/PageLoader/PageLoader";

function App() {
  const dispatch: AppDispatch = useDispatch();
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { isPageLoading } = useSelector((state: RootState) => state.systemModule);

  function getRoutes() {
    return routes.map(route => (
      <Route key={route.path} path={route.path} element={<route.component />}>
        {getNestedRoutes(route)}
      </Route>
    ));
  }

  function getNestedRoutes(route: TypeOfRoute) {
    const isHomePage = route.path === "home";
    if (isHomePage)
      return nestedRoutes.map(route => (
        <Route key={route.path} path={route.path} element={<route.component />} />
      ));

    const filteredNestedRoutes = nestedRoutes.filter(route => isHomePage && route.onlyHomePage);
    return filteredNestedRoutes.map(route => (
      <Route key={route.path} path={route.path} element={<route.component />} />
    ));
  }

  useEffect(() => {
    if (!loggedinUser) dispatch(autoLogin());
  }, [loggedinUser, dispatch]);

  return (
    <div className="app">
      {isPageLoading ? (
        <PageLoader />
      ) : (
        <div className="app-content">
          <SideBar />
          <Routes>
            <Route index element={<Navigate replace to="/home" />} />
            {getRoutes()}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          {!loggedinUser && <LoginSignupMsg />}
          <UserMsg />
        </div>
      )}
    </div>
  );
}

export default App;
