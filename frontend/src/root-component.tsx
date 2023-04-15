import { SideBar } from "./components/side-bar/side-bar";
import { Routes, Route } from "react-router-dom";
import routes from "./routes";
import "./styles/main.scss";
import { PageLoader } from "./components/loaders/page-loader";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { ComposePage } from "./pages/compose";
import { DisplayPage } from "./pages/display";
import { ChirperCirclePage } from "./pages/chirper-circle";

function RootComponent() {
  const { isPageLoading } = useSelector(
    (state: RootState) => state.systemModule
  );

  const isSideBarShown = window.location.pathname !== "/analytics";
  
  return (
    <div className="app">
      {isPageLoading && <PageLoader />}
      {!isPageLoading && (
        <div className="app-content">
          {isSideBarShown && <SideBar />}
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={<route.component />}
              >
                <Route path={"compose"} element={<ComposePage />} />
                <Route path={"display"} element={<DisplayPage />} />
                <Route
                  path={"chirper-circle"}
                  element={<ChirperCirclePage />}
                />
              </Route>
            ))}
          </Routes>
        </div>
      )}
    </div>
  );
}

export default RootComponent;
