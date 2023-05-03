import React, { useState, useEffect, useRef } from "react";
import { utilService } from "../../services/util.service/utils.service";
import { locationService } from "../../services/location.service";
import { storageService } from "../../services/storage.service";
import { FC } from "react";
import { Location } from "../../../../shared/interfaces/location.interface";

interface locationSearchBarProps {
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  fetchLocations: () => Promise<void>;
}

export const LocationSearchBar: FC<locationSearchBarProps> = ({ setLocations, fetchLocations }) => {
  useEffect(() => {
    fetchLocations();

    return () => {
      setLocations([]);
    };
  }, []);

  const handleInputChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = ev.target;

    if (!value) {
      fetchLocations();
      return;
    }

    const locations = await locationService.getLocationBySearchTerm(value);
    setLocations(locations);
  };

  return (
    <div>
      <input
        type="text"
        onChange={utilService.debounce(handleInputChange, 2000)}
        placeholder="Search for a location"
      />
    </div>
  );
};
