import { useEffect } from "react";

export const ChirperCirclePage = () => {

  useEffect(() => {
    document.title = "Chirper Circle • Chirper";
  }, []);

  return (
    <div>
      <h1>Chirper Circle</h1>
    </div>
  );
};
