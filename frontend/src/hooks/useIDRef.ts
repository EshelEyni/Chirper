import { useRef } from "react";
import { makeId } from "../services/util/utils.service";

function useUniqueID() {
  const id = useRef(makeId()).current;
  return { id };
}

export { useUniqueID };
