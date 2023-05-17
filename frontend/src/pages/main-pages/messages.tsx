import { useEffect } from "react";

export const MessagesPage = () => {

    useEffect(() => {
        document.title = "Messages / Chirper";
      }, []);

    
    return (
        <div>
            <h1>Messages Page</h1>
        </div>
    );
};
