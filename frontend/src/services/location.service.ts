import { httpService } from "./http.service";

export const locationService = {
  getUserDefaultLocations,
  getLocationBySearchTerm,
};

async function getLocationBySearchTerm(searchTerm: string) {
  try {
    const location = await httpService.get(`location/search?searchTerm=${searchTerm}`);
    return location;
  } catch (err) {
    console.log("locationService: Cannot get location");
    throw err;
  }
}

async function getUserDefaultLocations() {
  try {
    const currLocation = await _getCurrentLocation();
    if (currLocation) {
      const locations = await httpService.get(
        `location?lat=${currLocation.lat}&lng=${currLocation.lng}`
      );
      return locations;
    } else {
      return null;
    }
  } catch (err) {
    console.log("locationService: Cannot get location");
    throw err;
  }
}

function _getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          resolve({ lat, lng });
        },
        (error) => {
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
      console.error("Geolocation is not supported by this browser.");
      resolve(null);
    }
  });
}
