import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../../store/store";
import { User } from "../../../../../shared/interfaces/user.interface";
import userService from "../../../services/user.service";

export const ProfileDetails = () => {
  const [wachedUser, setWachedUser] = useState<User | null>(null);

  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    document.title = `${wachedUser?.fullname} (${wachedUser?.username}) / Chirper`;
  }, [wachedUser]);

  const getUser = async () => {
    const { username } = params;
    if (!username) {
      navigate("/home");
      return;
    }
    if (loggedinUser?.username === username) {
      setWachedUser(loggedinUser);
      return;
    } else {
      const user = await userService.getByUsername(username);
      setWachedUser(user);
    }
  };

  return (
    <div>
      <h1>Profile Details Page</h1>
      <pre>{JSON.stringify(wachedUser, null, 2)}</pre>
      <Outlet />
    </div>
  );
};
