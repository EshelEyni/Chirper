import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AppDispatch } from "../../store/types";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, Fragment } from "react";
import { BtnClose } from "../../components/btns/btn-close";
import { Location } from "../../../../shared/interfaces/location.interface";
import { LocationSearchBar } from "../../components/location/location-search-bar";
import { LocationList } from "../../components/location/location-list";
import { ContentLoader } from "../../components/loaders/content-loader";
import { locationService } from "../../services/location.service";
import { updateCurrNewPost } from "../../store/actions/new-post.actions";

export const PostLocation = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { homePage, sideBar, newPostType } = useSelector((state: RootState) => state.newPostModule);
  const currNewPost =
    newPostType === "home-page"
      ? homePage.posts[homePage.currPostIdx]
      : sideBar.posts[sideBar.currPostIdx];
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoResults, setisNoResults] = useState<boolean>(false);

  useEffect(() => {
    if (!currNewPost) return;
    if (currNewPost) {
      fetchLocations();
    }
  }, [currNewPost]);

  const onGoBack = () => {
    navigate("/");
  };

  const onConfirmLocation = () => {
    navigate("/");
    if (!selectedLocation || !currNewPost) return;
    dispatch(updateCurrNewPost({ ...currNewPost, location: selectedLocation }, newPostType));
  };

  const onClearLocation = () => {
    navigate("/");
    if (!currNewPost) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { location, ...postWithOutLocation } = currNewPost;
    dispatch(updateCurrNewPost(postWithOutLocation, newPostType));
  };

  const fetchLocations = async () => {
    const locations = await locationService.getUserDefaultLocations();
    if (!locations) return;
    if (currNewPost?.location) {
      const isLocationExist = locations.find((location: Location) => {
        return location.placeId === currNewPost?.location?.placeId;
      });
      if (!isLocationExist) {
        locations.unshift(currNewPost.location);
      }
      setLocations(locations);
      setSelectedLocation(currNewPost.location);
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
            {currNewPost?.location && (
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
          {!isLoading && !isNoResults && currNewPost && (
            <LocationList
              currNewPost={currNewPost}
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
