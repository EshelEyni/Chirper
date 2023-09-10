import { useLocation, useNavigate } from "react-router-dom";
import { getBasePathName } from "../services/util/utilService";

export function useGoBack(currNestedPath: string) {
  const navigate = useNavigate();
  const location = useLocation();

  function goBack() {
    const basePath = getBasePathName(location.pathname, currNestedPath);
    navigate(basePath);
  }

  return { goBack };
}
