import { useEffect } from "react";
import { SlMagnifier } from "react-icons/sl";
import { AiFillCloseCircle } from "react-icons/ai";
import { debounce } from "../../../services/util/utilService";
import "./GifSearchBar.scss";

interface GifSearchBarProps {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  SearchBarInputRef: React.RefObject<HTMLInputElement>;
}

export const GifSearchBar: React.FC<GifSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  SearchBarInputRef,
}) => {
  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    setSearchTerm(!inputValue ? "" : inputValue);
  }

  function onClearSearch() {
    setSearchTerm("");
    if (!SearchBarInputRef.current) return;
    SearchBarInputRef.current.value = "";
  }

  useEffect(() => {
    /*
     * This useEffect is used to update the search bar input value when the search term is select,
     * from the GIF category lisy.
     */
    if (!SearchBarInputRef.current || !searchTerm) return;
    SearchBarInputRef.current.value = searchTerm;
    SearchBarInputRef.current.focus();
  }, [searchTerm, SearchBarInputRef]);

  return (
    <div className="gif-search-bar">
      <label className="magnifing-glass-icon-label" htmlFor="gif-search-bar-input">
        <SlMagnifier className="magnifing-glass-icon" />
      </label>
      <input
        id="gif-search-bar-input"
        className="gif-search-bar-input"
        type="text"
        placeholder="Search for GIFs"
        autoComplete="off"
        autoFocus={true}
        onChange={debounce(handleChange, 1000).debouncedFunc}
        ref={SearchBarInputRef}
      />

      {searchTerm && (
        <AiFillCloseCircle
          className="close-icon"
          onMouseDown={() => onClearSearch()}
          data-testid="gif-search-bar-close-icon"
        />
      )}
    </div>
  );
};
