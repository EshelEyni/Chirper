import { Location } from "../../../../shared/types/location";
import { JsendResponse } from "../../../../shared/types/system";
import cacheService from "../cache/cacheService";
import httpService from "../http/httpService";
import queryString from "query-string";
import { handleServerResponseData } from "../util/utilService";

const ERROR_MESSAGES = {
  locationError: "locationService: Cannot get location",
  geolocationUnsupported: "Geolocation is not supported by this browser.",
};

async function getLocationsBySearchTerm(searchTerm: string): Promise<Location[]> {
  try {
    const response = (await httpService.get(
      `location/search?searchTerm=${searchTerm}`
    )) as unknown as JsendResponse<Location[]>;

    return handleServerResponseData<Location[]>(response);
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function getUserDefaultLocations(): Promise<Location[] | null> {
  try {
    const cacheLocation = await cacheService.get<Location[]>("location", 5);
    if (cacheLocation) return cacheLocation;
    const currLocation = await _getCurrentLocation();
    if (!currLocation) return null;
    const query = queryString.stringify(currLocation);
    const response = (await httpService.get(`location?${query}`)) as unknown as JsendResponse<
      Location[]
    >;
    cacheService.set("location", response.data);
    return handleServerResponseData<Location[]>(response);
  } catch (err) {
    console.error(ERROR_MESSAGES.locationError);
    throw err;
  }
}

function _getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve, _) => {
    if (!navigator.geolocation) {
      console.error(ERROR_MESSAGES.geolocationUnsupported);
      resolve(null);
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        resolve({ lat, lng });
      },
      (error: GeolocationPositionError) => {
        console.error("Error getting location:", error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
}

export default { getUserDefaultLocations, getLocationsBySearchTerm };
