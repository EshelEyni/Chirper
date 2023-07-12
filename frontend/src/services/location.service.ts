import { Location } from "../../../shared/interfaces/location.interface";
import { JsendResponse } from "../../../shared/interfaces/system.interface";
import { cacheService } from "./cache.service";
import { httpService } from "./http.service";
import queryString from "query-string";
import { handleServerResponse } from "./util.service/utils.service";

export const locationService = {
  getUserDefaultLocations,
  getLocationsBySearchTerm,
};

const ERROR_MESSAGES = {
  locationError: "locationService: Cannot get location",
  geolocationUnsupported: "Geolocation is not supported by this browser.",
};

async function getLocationsBySearchTerm(searchTerm: string): Promise<Location[]> {
  try {
    const response = (await httpService.get(
      `location/search?searchTerm=${searchTerm}`
    )) as unknown as JsendResponse;

    return handleServerResponse<Location[]>(response);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

async function getUserDefaultLocations(): Promise<Location[] | null> {
  try {
    const cacheLocation = cacheService.get("location", 5);
    if (cacheLocation) {
      return cacheLocation;
    }
    const currLocation = await _getCurrentLocation();
    if (currLocation) {
      const query = queryString.stringify(currLocation);
      const response = (await httpService.get(`location?${query}`)) as unknown as JsendResponse;
      cacheService.set("location", {
        cachedAt: Date.now(),
        data: response.data,
      });
      return handleServerResponse<Location[]>(response);
    } else {
      return null;
    }
  } catch (err) {
    console.log(ERROR_MESSAGES.locationError);
    throw err;
  }
}

function _getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
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
    } else {
      console.error(ERROR_MESSAGES.geolocationUnsupported);
      resolve(null);
    }
  });
}
