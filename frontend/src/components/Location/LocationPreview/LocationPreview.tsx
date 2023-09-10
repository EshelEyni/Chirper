import { FC } from "react";
import "./LocationPreview.scss";
import { Location } from "../../../../../shared/types/location";
import { AiOutlineCheck } from "react-icons/ai";

type LocationPreviewProps = {
  location: Location;
  selectedLocation: Location | null;
  onClickLocation: (location: Location) => void;
};

export const LocationPreview: FC<LocationPreviewProps> = ({
  location,
  selectedLocation,
  onClickLocation,
}) => {
  return (
    <li className="location-preview" onClick={() => onClickLocation(location)}>
      <span className="location-name">{location.name}</span>
      {selectedLocation?.placeId === location.placeId && <AiOutlineCheck className="check-icon" />}
    </li>
  );
};
