import React, { useState, useEffect, useRef } from "react";
import { utilService } from "../../services/util.service/utils.service";
import { locationService } from "../../services/location.service";
import { FC } from "react";
import { Location } from "../../../../shared/interfaces/location.interface";
import { SlMagnifier } from "react-icons/sl";
import { AiFillCloseCircle } from "react-icons/ai";

interface locationSearchBarProps {
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  fetchLocations: () => Promise<void>;
  isNoResults: boolean;
  setisNoResults: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LocationSearchBar: FC<locationSearchBarProps> = ({
  setLocations,
  fetchLocations,
  isNoResults,
  setisNoResults,
  isLoading,
  setIsLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchBarFocused, setIsSearchBarFocused] = useState<boolean>(false);
  const SearchBarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLocations();
    return () => {
      setLocations([]);
    };
  }, []);

  const handleChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (isNoResults) setisNoResults(false);
      const { value } = ev.target;
      setSearchTerm(value);
      if (!value) {
        fetchLocations();
        return;
      }
      setIsLoading(true);
      const locations = await locationService.getLocationsBySearchTerm(value);
      setIsLoading(false);
      if (locations.length === 0) {
        setisNoResults(true);
      } else {
        setLocations(locations);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onClearSearch = () => {
    setSearchTerm("");
    fetchLocations();
    SearchBarInputRef.current!.value = "";
  };

  return (
    <div className={"location-search-bar" + (isSearchBarFocused ? " focused" : "")}>
      <label className="magnifing-glass-icon-label" htmlFor="search-bar-input">
        <SlMagnifier className="magnifing-glass-icon" />
      </label>
      <input
        id="search-bar-input"
        className="location-search-bar-input"
        type="text"
        placeholder="Search locations"
        onChange={utilService.debounce(handleChange, 1000)}
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
