import { useRef } from "react";
import { makeId } from "../services/util/utilService";

function useUniqueID() {
  const id = useRef(makeId()).current;
  return { id };
}

export { useUniqueID };
