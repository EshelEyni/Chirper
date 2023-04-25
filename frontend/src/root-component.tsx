import { SideBar } from "./components/side-bar/side-bar";
import { Routes, Route } from "react-router-dom";
import routes from "./routes";
import "./styles/main.scss";
import { ComposePage } from "./pages/compose";
import { DisplayPage } from "./pages/display";
import { ChirperCirclePage } from "./pages/chirper-circle";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import { UserMsg } from "./components/other/user-msg";

function RootComponent() {
  const { isSideBarShown, userMsg } = useSelector(
    (state: RootState) => state.systemModule
  );

  return (
    <div className="app">
      <div className="app-content">
        {isSideBarShown && <SideBar />}
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={<route.component />}>
              <Route path={"compose"} element={<ComposePage />} />
              <Route path={"display"} element={<DisplayPage />} />
              <Route path={"chirper-circle"} element={<ChirperCirclePage />} />
            </Route>
          ))}
        </Routes>
        {userMsg && <UserMsg/>}
      </div>
    </div>
  );
}

export default RootComponent;
