import { FC, useState } from "react";
import { Location } from "../../../../shared/interfaces/location.interface";
import { AiOutlineCheck } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AppDispatch } from "../../store/types";
import { setNewPost } from "../../store/actions/post.actions";

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
  const { newPost } = useSelector((state: RootState) => state.postModule);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const onClickLocation = (location: Location) => {
    setSelectedLocation(location);
    dispatch(setNewPost({ ...newPost, location }));
    navigate("");
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
