import { useEffect } from "react";
import { useDocumentTitle } from "./useDocumentTitle";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/types";
import { setIsPageLoading } from "../store/slices/systemSlice";

type PageLoadedProps = {
  title: string;
};

export function usePageLoaded({ title }: PageLoadedProps) {
  const dispatch: AppDispatch = useDispatch();
  useDocumentTitle(title);

  useEffect(() => {
    dispatch(setIsPageLoading(false));
  }, [dispatch]);
}
