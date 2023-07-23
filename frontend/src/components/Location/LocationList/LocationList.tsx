import { FC } from "react";
import "./LocationList.scss";
import { Location } from "../../../../../shared/interfaces/location.interface";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import { NewPost } from "../../../../../shared/interfaces/post.interface";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import { LocationPreview } from "../LocationPreview/LocationPreview";

interface LocationListProps {
  currNewPost: NewPost;
  locations: Location[];
  selectedLocation: Location | null;
  setSelectedLocation: React.Dispatch<React.SetStateAction<Location | null>>;
}

export const LocationList: FC<LocationListProps> = ({
  currNewPost,
  locations,
  selectedLocation,
  setSelectedLocation,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { newPostType } = useSelector((state: RootState) => state.newPostModule);

  function onClickLocation(location: Location) {
    setSelectedLocation(location);
    dispatch(updateCurrNewPost({ ...currNewPost, location }, newPostType));
    navigate("/home");
  }

  return (
    <ul className="location-list">
      {locations.map((location, idx) => {
        return (
          <LocationPreview
            key={idx}
            location={location}
            selectedLocation={selectedLocation}
            onClickLocation={onClickLocation}
          />
        );
      })}
    </ul>
  );
};