import { useEffect } from "react";

export const AnalyticsPage = () => {

  useEffect(() => {
    document.title = "Analytics • Chirper";
  }, []);

  return (
    <div>
      <h1>Analytics</h1>
    </div>
  );
};
