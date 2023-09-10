import { useQuery } from "@tanstack/react-query";
import gifService from "../services/GIF/GIFService";
import { Gif } from "../../../shared/types/gif.interface";

const getGifsBySearchTerm = async (searchTerm: string): Promise<Gif[]> => {
  const gifs = await gifService.getGifsBySearchTerm(searchTerm);
  return gifs as Gif[];
};

export const useQueryGifs = (searchTerm: string) => {
  const {
    data: gifs,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useQuery(["searchGifs", searchTerm], () => getGifsBySearchTerm(searchTerm), {
    enabled: !!searchTerm,
  });

  const isEmpty = gifs && gifs.length === 0;

  return { gifs, error, isLoading, isSuccess, isError, isEmpty };
};
