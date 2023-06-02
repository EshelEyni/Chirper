import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Outlet } from "react-router-dom";

export const ProfileDetails = () => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);

  useEffect(() => {
    document.title = `${loggedinUser?.fullname} (${loggedinUser?.username}) / Chirper`;
  }, []);

  return (
    <div>
      <h1>Profile Details Page</h1>
      <Outlet />
    </div>
  );
};
