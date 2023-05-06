import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export const UserMsg = () => {
  const { userMsg } = useSelector((state: RootState) => state.systemModule);
  if (!userMsg) return null;
  return (
    <div className={"user-msg " + userMsg.type}>
      <p>{userMsg.text}</p>
    </div>
  );
};
