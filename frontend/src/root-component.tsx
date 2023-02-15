import { SideBar } from "./components/side-bar/side-bar";
import { Routes, Route  } from "react-router-dom";
import routes from "./routes";
import "./styles/main.scss";
import { PageLoader } from "./components/loaders/page-loader";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { ComposePage } from "./pages/compose";

function RootComponent() {
  const { isPageLoading } = useSelector(
    (state: RootState) => state.systemModule
  );

  return (
    <div className="app">
      {isPageLoading && <PageLoader />}
      {!isPageLoading && (
        <div className="app-content">
          <SideBar />
          <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={<route.component />}
              >
                <Route path={"compose"} element={<ComposePage />} />
              </Route>
            ))}
          </Routes>
        </div>
      )}
    </div>
  );
}

export default RootComponent;
