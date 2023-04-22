import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export const UserMsg = () => {
  const { userMsg } = useSelector((state: RootState) => state.systemModule);

  return (
    <div className="user-msg">
      <p>{userMsg}</p>
    </div>
  );
};
