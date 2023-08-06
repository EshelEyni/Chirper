import { useEffect } from "react";

const ChirperCirclePage = () => {
  useEffect(() => {
    document.title = "Chirper Circle / Chirper";
  }, []);

  return (
    <div>
      <h1>Chirper Circle</h1>
    </div>
  );
};

export default ChirperCirclePage;
