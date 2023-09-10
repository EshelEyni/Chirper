require("dotenv").config();
import {
  ClientResponse,
  GeocodingResult,
  PlaceAutocompleteResult,
  PlaceSearchResponse,
  PlaceSearchResult,
  ReverseGeocodingResponse,
  createClient,
} from "@google/maps";

import { Location } from "../../../../shared/types/location";

type resultType = PlaceAutocompleteResult | PlaceSearchResult | GeocodingResult;

const googleMapsClient = createClient({
  key: process.env.GOOGLE_API_KEY || "",
  Promise: Promise,
});

async function getUserSurroundingLocations(lat: number, lng: number): Promise<Location[]> {
  const currLoaction = await _getCurrUserLocation(lat, lng);
  const response = await googleMapsClient
    .placesNearby({
      location: [lat, lng],
      radius: 15000,
      language: "en",
    })
    .asPromise();
  const locations = _getLocationFromResponse({ response }) as Location[];
  return currLoaction ? [currLoaction, ...locations.slice(0, 6)] : locations.slice(0, 7);
}

async function getLocationBySearchTerm(searchTerm: string): Promise<Location[]> {
  const response = await googleMapsClient
    .placesAutoComplete({
      input: searchTerm,
      language: "en",
      types: "(cities)",
    })
    .asPromise();
  const { predictions } = response.json;
  const locations: Location[] = predictions.map(_formatResultToLocationObj);
  await _setCoordsToPrecditedLocations(locations);
  return locations;
}

async function _getCurrUserLocation(lat: number, lng: number): Promise<Location | null> {
  const response = await googleMapsClient
    .reverseGeocode({
      latlng: { lat, lng },
      language: "en",
    })
    .asPromise();
  return _getLocationFromResponse({ response, isSingleResult: true }) as Location;
}

function _getLocationFromResponse({
  response,
  isSingleResult = false,
}: {
  response: ClientResponse<PlaceSearchResponse | ReverseGeocodingResponse>;
  isSingleResult?: boolean;
}): Location[] | Location | null {
  const englishRegex = /^[A-Za-z0-9\s.,!?@()_\\-]+$/;
  const plusSignRegex = /\+/;
  const { results } = response.json;

  if (isSingleResult) {
    const result = (results as GeocodingResult[]).find(
      (location: GeocodingResult) =>
        englishRegex.test(location.formatted_address) &&
        !plusSignRegex.test(location.formatted_address)
    );
    return result ? _formatResultToLocationObj(result) : null;
  }

  return (results as PlaceSearchResult[])
    .filter((location: PlaceSearchResult) => englishRegex.test(location.name))
    .map(_formatResultToLocationObj);
}

function _formatResultToLocationObj(result: resultType): Location {
  const isGeocodingResult = (obj: resultType): obj is GeocodingResult => "formatted_address" in obj;
  const isPlaceAutocompleteResult = (obj: resultType): obj is PlaceAutocompleteResult =>
    "description" in obj;
  let name: string, lat: number, lng: number;
  if (isGeocodingResult(result)) name = result.formatted_address;
  else if (isPlaceAutocompleteResult(result)) name = result.description;
  // eslint-disable-next-line prefer-destructuring
  else name = result.name;

  const { place_id } = result;
  if (isPlaceAutocompleteResult(result)) lat = lng = 0;
  else {
    const { lat: resLat, lng: resLng } = result.geometry.location;
    (lat = resLat), (lng = resLng);
  }
  return { name, placeId: place_id, lat: lat, lng: lng };
}

async function _setCoordsToPrecditedLocations(locations: Location[]) {
  for (const location of locations) {
    const response = await googleMapsClient
      .place({
        placeid: location.placeId,
        language: "en",
      })
      .asPromise();
    const { lat: resLat, lng: resLng } = response.json.result.geometry.location;
    (location.lat = resLat), (location.lng = resLng);
  }
}

export default {
  getUserSurroundingLocations,
  getLocationBySearchTerm,
};
