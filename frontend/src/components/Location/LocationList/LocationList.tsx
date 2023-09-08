import { FC } from "react";
import "./LocationList.scss";
import { Location } from "../../../../../shared/types/location.interface";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import { NewPost } from "../../../../../shared/types/post.interface";
import { LocationPreview } from "../LocationPreview/LocationPreview";
import { updateNewPost } from "../../../store/slices/postEditSlice";

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
  const { newPostType } = useSelector((state: RootState) => state.postEdit);

  function onClickLocation(location: Location) {
    setSelectedLocation(location);
    dispatch(updateNewPost({ newPost: { ...currNewPost, location }, newPostType }));
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
