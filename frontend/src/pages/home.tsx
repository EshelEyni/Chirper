import { Outlet } from "react-router-dom";

export const HomePage = () => {


    return (
        <main className="home">
            <h1>Home Page</h1>
            <Outlet/>
        </main>
    );
};
