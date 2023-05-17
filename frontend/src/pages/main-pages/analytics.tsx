import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setIsSideBarShown } from "../../store/actions/system.actions";
import { AppDispatch } from "../../store/types";

export const AnalyticsPage = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    document.title = "Analytics / Chirper";
    dispatch(setIsSideBarShown(false));
  }, []);

  return (
    <div>
      <h1>Analytics</h1>
    </div>
  );
};
