import { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { routes, nestedRoutes } from "./routes";
import { AppDispatch } from "./store/types";
import { RootState } from "./store/store";
import { SideBar } from "./components/SideBar/SideBar";
import { LoginSignupMsg } from "./components/Msg/LoginSignupMsg/LoginSignupMsg";
import { Route as TypeOfRoute } from "./routes";
import { PageLoader } from "./components/Loaders/PageLoader/PageLoader";
import { AuthGuard } from "./guards/AuthGuard";
import { loginWithToken } from "./store/slices/authSlice";
const PageNotFound = lazy(() => import("./pages/MainPages/PageNotFound/PageNotFound"));
import "./styles/main.scss";

function App() {
  const dispatch: AppDispatch = useDispatch();
  const { loggedInUser } = useSelector((state: RootState) => state.auth);
  const { isPageLoading } = useSelector((state: RootState) => state.system);

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
    if (!loggedInUser) dispatch(loginWithToken());
  }, [loggedInUser, dispatch]);

  return (
    <div id="app" className="app">
      <div className="app-content" id="app-content">
        <SideBar />
        <Suspense fallback={<PageLoader isBirdLoader={isPageLoading} />}>
          <Routes>
            <Route index element={<Navigate replace to="/home" />} />
            {getRoutes()}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
        {!loggedInUser && <LoginSignupMsg />}
      </div>
    </div>
  );
}

export default App;
