import React from "react";
import ReactDOM from "react-dom/client";
import RootComponent from "./root-component";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <React.StrictMode>
      <Router>
        <RootComponent />
      </Router>
    </React.StrictMode>
  </Provider>
);
