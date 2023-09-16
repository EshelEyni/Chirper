import { useRef } from "react";
import { createId } from "../services/util/utilService";

function useUniqueID() {
  const id = useRef(createId()).current;
  return { id };
}

export { useUniqueID };
