import { useEffect, useState } from "react";
import { SlMagnifier } from "react-icons/sl";
import { AiFillCloseCircle } from "react-icons/ai";
import { debounce } from "../../../services/util/utilService";
import "./GifSearchBar.scss";

interface GifSearchBarProps {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  // setGifs: (gifs: Gif[]) => void;
  SearchBarInputRef: React.RefObject<HTMLInputElement>;
}

export const GifSearchBar: React.FC<GifSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  SearchBarInputRef,
}) => {
  const [isSearchBarFocused, setIsSearchBarFocused] = useState<boolean>(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    if (!inputValue) {
      setSearchTerm("");
      return;
    }
    setSearchTerm(inputValue);
  }

  function onClearSearch() {
    setSearchTerm("");
    if (!SearchBarInputRef.current) return;
    SearchBarInputRef.current.value = "";
  }

  useEffect(() => {
    if (!searchTerm) return;
    setIsSearchBarFocused(true);
    if (!SearchBarInputRef.current) return;
    SearchBarInputRef.current.value = searchTerm;
    SearchBarInputRef.current.focus();
  }, [searchTerm, SearchBarInputRef]);

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
