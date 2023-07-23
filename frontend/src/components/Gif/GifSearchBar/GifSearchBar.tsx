import { useEffect, useState } from "react";
import { SlMagnifier } from "react-icons/sl";
import { AiFillCloseCircle } from "react-icons/ai";
import { Gif } from "../../../../../shared/interfaces/gif.interface";
import { gifService } from "../../../services/gif.service";
import { debounce } from "../../../services/util.service/utils.service";
import "./GifSearchBar.scss";

interface GifSearchBarProps {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  setGifs: (gifs: Gif[]) => void;
  SearchBarInputRef: React.RefObject<HTMLInputElement>;
}

export const GifSearchBar: React.FC<GifSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  setGifs,
  SearchBarInputRef,
}) => {
  const [isSearchBarFocused, setIsSearchBarFocused] = useState<boolean>(false);

  async function getgifsBySearchTerm(searchTerm: string): Promise<Gif[]> {
    const gifs = await gifService.getGifsBySearchTerm(searchTerm);
    return gifs as Gif[];
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    if (!inputValue) {
      setSearchTerm("");
      setGifs([]);
      return;
    }
    setGifs([]);
    const gifs = await getgifsBySearchTerm(inputValue);
    setGifs(gifs);
    setSearchTerm(inputValue);
  }

  function onClearSearch() {
    setSearchTerm("");
    setGifs([]);
    SearchBarInputRef.current!.value = "";
  }

  useEffect(() => {
    SearchBarInputRef.current!.value = searchTerm;
    SearchBarInputRef.current!.focus();
    setIsSearchBarFocused(true);
  }, [searchTerm]);

  return (
    <div className={"gif-search-bar" + (isSearchBarFocused ? " focused" : "")}>
      <label className="magnifing-glass-icon-label" htmlFor="gif-search-bar-input">
        <SlMagnifier className="magnifing-glass-icon" />
      </label>
      <input
        id="gif-search-bar-input"
        className="gif-search-bar-input"
        type="text"
        placeholder="Search for GIFs"
        autoComplete="off"
        onChange={debounce(handleChange, 1000).debouncedFunc}
        onFocus={() => setIsSearchBarFocused(true)}
        onBlur={() => setIsSearchBarFocused(false)}
        ref={SearchBarInputRef}
      />

      {searchTerm && (
        <AiFillCloseCircle className="close-icon" onMouseDown={() => onClearSearch()} />
      )}
    </div>
  );
};