import { FC } from "react";
import "./ErrorFallBack.scss";

interface ErrorFallBackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallBack: FC<ErrorFallBackProps> = ({ error, resetErrorBoundary }) => {
  const isDevEnv = process.env.NODE_ENV === "development";
  return (
    <main className="error-fallback">
      <div className="error-fallback-msg">
        <h1>Oops! Something went wrong.</h1>
        <p>
          We apologize for the inconvenience. You can either try reloading the page or go back to
          the home page.
        </p>

        {isDevEnv && (
          <details>
            <summary>Details</summary>
            <p>{error.message}</p>
            <pre>{error.stack}</pre>
          </details>
        )}

        <div className="error-actions">
          <button onClick={() => window.location.reload()}>
            <span>Reload</span>
          </button>
          <button onClick={resetErrorBoundary}>
            <span>Home</span>
          </button>
        </div>
      </div>
    </main>
  );
};
