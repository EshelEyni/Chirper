import { useEffect } from "react";

export const MessagesPage = () => {
  useEffect(() => {
    document.title = "Messages / Chirper";
  }, []);

  return (
    <section>
      <h1>Messages Page</h1>
    </section>
  );
};
