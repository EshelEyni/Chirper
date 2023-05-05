import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AppDispatch } from "../../store/types";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import { BtnClose } from "../../components/btns/btn-close";
import { setNewPost } from "../../store/actions/post.actions";
import { storageService } from "../../services/storage.service";
import { Location } from "../../../../shared/interfaces/location.interface";
import { LocationSearchBar } from "../../components/location/location-search-bar";
import { LocationList } from "../../components/location/location-list";
import { ContentLoader } from "../../components/loaders/content-loader";
import { locationService } from "../../services/location.service";

export const PostLocation = () => {
  const { newPost } = useSelector((state: RootState) => state.postModule);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoResults, setisNoResults] = useState<boolean>(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const onGoBack = () => {
    navigate("");
  };

  const onConfirmLocation = () => {
    navigate("");
    if (!selectedLocation) return;
    dispatch(setNewPost({ ...newPost, location: selectedLocation }));
  };

  const onClearLocation = () => {
    navigate("");
    const { location, ...postWithOutLocation } = newPost;
    dispatch(setNewPost(postWithOutLocation));
  };

  const fetchLocations = async () => {
    // const locations = await locationService.getUserDefaultLocations();
    // if(!locations) return;
    const locations = storageService.get("locations");
    if (newPost.location) {
      const isLocationExist = locations.find((location: Location) => {
        return location.placeId === newPost?.location?.placeId;
      });
      if (!isLocationExist) {
        locations.unshift(newPost.location);
      }
      setLocations(locations);
      setSelectedLocation(newPost.location);
    } else {
      setLocations(locations);
      setSelectedLocation(locations[0]);
    }
    setIsLoading(false);
  };

  return (
    <Fragment>
      <div className="main-screen dark-light" onClick={onGoBack}></div>
      <section className="post-location">
        <header className="post-location-header">
          <div className="post-location-header-close-btn-title-container">
            <div className="btn-close-container">
              <BtnClose onClickBtn={onGoBack} />
            </div>
            <h3 className="post-location-title">Tag location</h3>
          </div>
          <div className="post-location-header-btns-container">
            {newPost.location && (
              <button className="btn-clear-location" onClick={onClearLocation}>
                <span>Remove</span>
              </button>
            )}
            <button className={"btn-confirm-location"} onClick={onConfirmLocation}>
              Done
            </button>
          </div>
        </header>
        <LocationSearchBar
          setLocations={setLocations}
          fetchLocations={fetchLocations}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isNoResults={isNoResults}
          setisNoResults={setisNoResults}
        />
        <main className="post-location-main-container">
          {isLoading && <ContentLoader />}
          {!isLoading && !isNoResults && (
            <LocationList
              locations={locations}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
            />
          )}

          {isNoResults && (
            <div className="no-result-msg">
              <p>No places were found</p>
            </div>
          )}
        </main>
      </section>
    </Fragment>
  );
};
