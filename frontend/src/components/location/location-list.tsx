import { FC, useState } from "react";
import { Location } from "../../../../shared/interfaces/location.interface";
import { AiOutlineCheck } from "react-icons/ai";

interface LocationListProps {
  locations: Location[];
  selectedLocation: Location | null;
  setSelectedLocation: React.Dispatch<React.SetStateAction<Location | null>>;
}

export const LocationList: FC<LocationListProps> = ({
  locations,
  selectedLocation,
  setSelectedLocation,
}) => {
  const onClickLocation = (location: Location) => {
    setSelectedLocation(location);
  };
  return (
    <ul className="location-list">
      {locations.map((location, idx) => {
        return (
          <li key={idx} className="location-preview" onClick={() => onClickLocation(location)}>
            <span className="location-name">{location.name}</span>
            {selectedLocation?.placeId === location.placeId && (
              <AiOutlineCheck className="check-icon" />
            )}
          </li>
        );
      })}
    </ul>
  );
};
