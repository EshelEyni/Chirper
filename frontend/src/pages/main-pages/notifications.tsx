import { useEffect } from "react";

export const NotificationsPage = () => {

    useEffect(() => {
        document.title = "Notifications • Chirper";
        }, []);

    return (
        <div>
            <h1>Notifications Page</h1>
        </div>
    );
};
