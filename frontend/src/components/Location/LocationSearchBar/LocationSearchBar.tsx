import { FC, useState, useEffect, useRef } from "react";
import { debounce } from "../../../services/util/utilService";
import locationService from "../../../services/location/locationService";
import { Location } from "../../../../../shared/types/location";
import { SlMagnifier } from "react-icons/sl";
import { AiFillCloseCircle } from "react-icons/ai";
import "./LocationSearchBar.scss";

interface locationSearchBarProps {
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  fetchLocations: () => Promise<void>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LocationSearchBar: FC<locationSearchBarProps> = ({
  setLocations,
  fetchLocations,
  setIsLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const SearchBarInputRef = useRef<HTMLInputElement>(null);

  async function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
    try {
      const { value } = ev.target;
      setSearchTerm(value);
      if (!value) return fetchLocations();
      setIsLoading(true);
      const locations = await locationService.getLocationsBySearchTerm(value);
      setIsLoading(false);
      setLocations(locations);
    } catch (err) {
      console.error(err);
    }
  }

  function onClearSearch() {
    setSearchTerm("");
    fetchLocations();
    SearchBarInputRef.current?.value && (SearchBarInputRef.current.value = "");
    setTimeout(() => SearchBarInputRef.current?.focus(), 0);
  }

  useEffect(() => {
    fetchLocations();
    return () => {
      setLocations([]);
    };
  }, [fetchLocations, setLocations]);

  return (
    <div className="location-search-bar">
      <label
        className="location-search-bar-label"
        htmlFor="search-bar-input"
        data-testid="location-search-bar-label"
      >
        <SlMagnifier className="magnifing-glass-icon" />
      </label>
      <input
        id="search-bar-input"
        className="location-search-bar-input"
        type="text"
        placeholder="Search locations"
        onChange={debounce(handleChange, 1000).debouncedFunc}
        autoFocus={true}
        ref={SearchBarInputRef}
      />
      {searchTerm && (
        <AiFillCloseCircle
          className="close-icon"
          onMouseDown={() => onClearSearch()}
          data-testid="location-search-bar-close-icon"
        />
      )}
    </div>
  );
};
