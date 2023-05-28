import { FC } from "react";
import { Location } from "../../../../shared/interfaces/location.interface";
import { AiOutlineCheck } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AppDispatch } from "../../store/types";
import { NewPost } from "../../../../shared/interfaces/post.interface";
import { updateCurrNewPost } from "../../store/actions/post.actions";
import { NewPostType } from "../../store/reducers/post.reducer";

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
  const { newPostType }: { newPostType: NewPostType } = useSelector(
    (state: RootState) => state.postModule.newPostState
  );

  const onClickLocation = (location: Location) => {
    setSelectedLocation(location);
    dispatch(updateCurrNewPost({ ...currNewPost, location }, newPostType));
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
