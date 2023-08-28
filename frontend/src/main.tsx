import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallBack } from "./components/App/ErrorFallBack/ErrorFallBack";

const FIVE_MINUTES = 5 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallBack} onReset={() => window.location.replace("/")}>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <Router>
            <App />

            <Toaster
              position="bottom-center"
              gutter={12}
              toastOptions={{ error: { duration: 3000 } }}
            />
          </Router>
        </QueryClientProvider>
      </ReduxProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
