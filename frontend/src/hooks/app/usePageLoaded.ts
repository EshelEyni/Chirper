import { useEffect } from "react";
import { useDocumentTitle } from "./useDocumentTitle";
import { setIsPageLoading } from "../../store/slices/systemSlice";
import { AppDispatch } from "../../store/types";
import { useDispatch } from "react-redux";

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
