import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { AppDispatch } from "../../../store/types";
import { Location } from "../../../../../shared/interfaces/location.interface";
import { updateCurrNewPost } from "../../../store/actions/new-post.actions";
import  locationService  from "../../../services/location.service";
import "./PostLocation.scss";
import { LocationList } from "../../../components/Location/LocationList/LocationList";
import { ContentLoader } from "../../../components/Loaders/ContentLoader/ContentLoader";
import { LocationSearchBar } from "../../../components/Location/LocationSearchBar/LocationSearchBar";
import { BtnClose } from "../../../components/Btns/BtnClose/BtnClose";
import { MainScreen } from "../../../components/App/MainScreen/MainScreen";

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
  // TODO: Check if isNoResults is needed. can be replaced with locations.length === 0
  const [isNoResults, setisNoResults] = useState<boolean>(false);

  const onGoBack = () => {
    navigate("/home");
  };

  const onConfirmLocation = () => {
    navigate("/home");
    if (!selectedLocation || !currNewPost) return;
    dispatch(updateCurrNewPost({ ...currNewPost, location: selectedLocation }, newPostType));
  };

  const onClearLocation = () => {
    navigate("/home");
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

  useEffect(() => {
    if (!currNewPost) return;
    if (currNewPost) {
      fetchLocations();
    }
  }, [currNewPost]);

  return (
    <>
      <MainScreen onClickFn={onGoBack} mode="light" />
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
    </>
  );
};
