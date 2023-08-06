import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { routes, nestedRoutes } from "./routes";
import { AppDispatch } from "./store/types";
import "./styles/main.scss";
import { loginWithToken } from "./store/actions/auth.actions";
import { RootState } from "./store/store";
import { SideBar } from "./components/SideBar/SideBar";
import { UserMsg } from "./components/Msg/UserMsg/UserMsg";
import { LoginSignupMsg } from "./components/Msg/LoginSignupMsg/LoginSignupMsg";
import { Route as TypeOfRoute } from "./routes";
import { PageLoader } from "./components/Loaders/PageLoader/PageLoader";
import { AuthGuard } from "./guards/AuthGuard";
const PageNotFound = lazy(() => import("./pages/MainPages/PageNotFound/PageNotFound"));

function App() {
  const dispatch: AppDispatch = useDispatch();
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const { isPageLoading } = useSelector((state: RootState) => state.systemModule);

  function getRoutes() {
    return routes.map(route => (
      <Route key={route.path} path={route.path} element={geRouteElement(route)}>
        {getNestedRoutes(route)}
      </Route>
    ));
  }

  function getNestedRoutes(route: TypeOfRoute) {
    const getRoute = (route: TypeOfRoute) => (
      <Route key={route.path} path={route.path} element={geRouteElement(route)} />
    );
    const isHomePage = route.path === "home";
    if (isHomePage) return nestedRoutes.map(route => getRoute(route));
    return nestedRoutes.filter(route => !route.homePageOnly).map(route => getRoute(route));
  }

  function geRouteElement(route: TypeOfRoute) {
    return route.authRequired ? <AuthGuard component={<route.component />} /> : <route.component />;
  }

  useEffect(() => {
    if (!loggedinUser) dispatch(loginWithToken());
  }, [loggedinUser, dispatch]);

  return (
    <div className="app">
      {isPageLoading ? (
        <PageLoader />
      ) : (
        <div className="app-content">
          <SideBar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route index element={<Navigate replace to="/home" />} />
              {getRoutes()}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
          {!loggedinUser && <LoginSignupMsg />}
          <UserMsg />
        </div>
      )}
    </div>
  );
}

export default App;
