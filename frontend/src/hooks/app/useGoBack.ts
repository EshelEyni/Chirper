import { useLocation, useNavigate } from "react-router-dom";
import { getBasePathName } from "../../services/util/utils.service";

export function useGoBack(currNestedPath: string) {
  const navigate = useNavigate();
  const location = useLocation();

  function onGoBack() {
    const basePath = getBasePathName(location.pathname, currNestedPath);
    navigate(basePath);
  }

  return { onGoBack };
}
