import { useEffect } from "react";

export const BookmarksPage = () => {
    
    useEffect(() => {
        document.title = "Bookmarks • Chirper";
      }, []);

    return (
        <div>
            <h1>Bookmarks Page</h1>
        </div>
    );
};
