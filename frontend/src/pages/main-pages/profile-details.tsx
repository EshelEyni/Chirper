import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Outlet, useParams } from "react-router-dom";
import { userService } from "../../services/user.service";
import { User } from "../../../../shared/interfaces/user.interface";

export const ProfileDetails = () => {
  const { loggedinUser } = useSelector((state: RootState) => state.authModule);
  const params = useParams();
  const [wachedUser, setWachedUser] = useState<User | null>(null);

  useEffect(() => {
    getUser();
    // document.title = `${loggedinUser?.fullname} (${loggedinUser?.username}) / Chirper`;
  }, []);

  const getUser = async () => {
    const { id } = params;
    if (!id) return;
    if (loggedinUser?.id === id) {
      setWachedUser(loggedinUser);
      return;
    } else {
      const user = await userService.getById(id);
      setWachedUser(user);
    }
    document.title = `${wachedUser?.fullname} (${wachedUser?.username}) / Chirper`;
  };

  return (
    <div>
      <h1>Profile Details Page</h1>
      <pre>{JSON.stringify(wachedUser, null, 2)}</pre>
      <Outlet />
    </div>
  );
};
