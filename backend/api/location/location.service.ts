import config from "../../config";
import { location } from "../../../shared/interfaces/location.interface";

const googleMapsClient = require("@google/maps").createClient({
  key: config.googleApiKey,
  Promise: Promise,
});

async function getUserSurroundingLocations(lat: number, lng: number): Promise<location[]> {
  try {
    const currLoaction = await _getCurrUserLocation(lat, lng);
    const response = await googleMapsClient
      .placesNearby({
        location: [lat, lng],
        radius: 15000,
        language: "en",
      })
      .asPromise();

    const results = response.json.results;
    const englishRegex = /^[A-Za-z0-9\s.,!?@()_\-]+$/;
    const locations = results
      .map((location: any) => {
        return {
          name: location.name,
          placeId: location.place_id,
          lat: location.geometry.location.lat,
          lng: location.geometry.location.lng,
        };
      })
      .filter((location: any) => englishRegex.test(location.name));

    if (currLoaction) {
      return [currLoaction, ...locations.slice(0, 6)];
    } else {
      return locations.slice(0, 7);
    }
  } catch (error) {
    throw error;
  }
}

async function _getCurrUserLocation(lat: number, lng: number): Promise<location> {
  const response = await googleMapsClient
    .reverseGeocode({
      latlng: { lat, lng },
      language: "en",
    })
    .asPromise();

  const englishRegex = /^[A-Za-z0-9\s.,!?@()_\-]+$/;
  const plusSignRegex = /\+/;

  const results = response.json.results;
  const result = results.find((location: any) => {
    return englishRegex.test(location.formatted_address) && !plusSignRegex.test(location.formatted_address);
  });

  const location = {
    name: result.formatted_address,
    placeId: result.place_id,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
  };

  return location;
}

async function getLocationBySearchTerm(searchTerm: string): Promise<location[]> {
  try {
    const response = await googleMapsClient
      .placesAutoComplete({
        input: searchTerm,
        language: "en",
        types: "(cities)",
      })
      .asPromise();
    const res = response.json.predictions;
    const locations = res.map((location: any) => {
      return {
        name: location.description,
        placeId: location.place_id,
      };
    });

    for (const location of locations) {
      const response = await googleMapsClient
        .place({
          placeid: location.placeId,
          language: "en",
        })
        .asPromise();
      const res = response.json.result;
      location.lat = res.geometry.location.lat;
      location.lng = res.geometry.location.lng;
    }

    return locations;
  } catch (error) {
    throw error;
  }
}

export const locationService = {
  getUserSurroundingLocations,
  getLocationBySearchTerm,
};
