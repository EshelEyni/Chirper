/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleMapsClientWithPromise } from "@google/maps";

const mockPlacesNearby = jest.fn();
const mockReverseGeocode = jest.fn();
const mockPlacesAutoComplete = jest.fn();
const mockPlace = jest.fn();

const createMockGoogleMapsClient = (): GoogleMapsClientWithPromise =>
  ({
    placesNearby: mockPlacesNearby,
    reverseGeocode: mockReverseGeocode,
    placesAutoComplete: mockPlacesAutoComplete,
    place: mockPlace,
  } as any);

describe("Location Service", () => {
  let locationService: any;

  describe("getUserSurroundingLocations", () => {
    function setMockResponse({
      isNoResults = false,
      nameKey = "name",
      names = ["New York"],
    }: {
      isNoResults?: boolean;
      nameKey?: "name" | "formatted_address";
      names?: string[];
    }) {
      const getResultItem = (name: string, idx: number) => ({
        [nameKey]: name,
        place_id: idx.toString(),
        geometry: { location: { lat: 1, lng: 1 } },
      });
      const results: any = names.map(getResultItem);
      return isNoResults ? { json: { results: [] } } : { json: { results } };
    }

    // used to mock the google maps client in getUserSurroundingLocations
    function setMockPlacesNearby(mockedResponse: any) {
      mockPlacesNearby.mockReturnValueOnce({
        asPromise: jest.fn().mockResolvedValue(mockedResponse),
      });
    }

    // used to mock the google maps client in _getCurrUserLocation
    function setMockReverseGeocode(mockedResponse: any) {
      mockReverseGeocode.mockReturnValueOnce({
        asPromise: jest.fn().mockResolvedValue(mockedResponse),
      });
    }

    beforeEach(() => {
      jest.clearAllMocks();
      jest.doMock("@google/maps", () => ({
        createClient: () => createMockGoogleMapsClient(),
      }));

      locationService = require("./LocationService").default;
    });

    it("should get user surrounding locations", async () => {
      setMockPlacesNearby(setMockResponse({ names: ["New York"] }));
      setMockReverseGeocode(setMockResponse({ nameKey: "formatted_address", names: ["Tel Aviv"] }));
      const locations = await locationService.getUserSurroundingLocations(1, 1);
      expect(mockReverseGeocode).toHaveBeenCalledTimes(1);
      expect(mockPlacesNearby).toHaveBeenCalledTimes(1);
      expect(locations).toHaveLength(2);
      expect(locations[0]).toHaveProperty("name", "Tel Aviv");
      expect(locations[1]).toHaveProperty("name", "New York");
    });

    it("should not include current location when reverseGeocode does not return any results", async () => {
      setMockPlacesNearby(setMockResponse({ names: ["New York", "Medrid"] }));
      setMockReverseGeocode(setMockResponse({ isNoResults: true }));
      const locations = await locationService.getUserSurroundingLocations(1, 1);
      expect(locations).toHaveLength(2);
      expect(locations[0]).toHaveProperty("name", "New York");
      expect(locations[1]).toHaveProperty("name", "Medrid");
    });

    it("should not include current location when _getCurrUserLocation returns a result with a non-English name", async () => {
      setMockPlacesNearby(setMockResponse({ names: ["New York", "Medrid"] }));
      setMockReverseGeocode(setMockResponse({ nameKey: "formatted_address", names: ["测试地址"] }));
      const locations = await locationService.getUserSurroundingLocations(1, 1);
      expect(locations).toHaveLength(2);
      expect(locations[0]).toHaveProperty("name", "New York");
      expect(locations[1]).toHaveProperty("name", "Medrid");
    });

    it("should not include locations with non-English names", async () => {
      setMockPlacesNearby(setMockResponse({ names: ["New York", "תל אביב"] }));
      setMockReverseGeocode(setMockResponse({ nameKey: "formatted_address", names: ["Tel Aviv"] }));
      const locations = await locationService.getUserSurroundingLocations(1, 1);
      expect(locations).toHaveLength(2);
      expect(locations[0]).toHaveProperty("name", "Tel Aviv");
      expect(locations[1]).toHaveProperty("name", "New York");
    });

    it("should return only the first 7 locations when there are more than 7 locations", async () => {
      const names = [
        "New York",
        "London",
        "Paris",
        "Tokyo",
        "Sydney",
        "Berlin",
        "Madrid",
        "Rome",
        "Beijing",
        "Moscow",
      ];
      const currUserLocationName = "Tel Aviv";
      setMockPlacesNearby(setMockResponse({ names }));
      setMockReverseGeocode(
        setMockResponse({ nameKey: "formatted_address", names: [currUserLocationName] })
      );
      const locations = await locationService.getUserSurroundingLocations(1, 1);
      expect(locations).toHaveLength(7);
      expect(locations[0]).toHaveProperty("name", currUserLocationName);
      [currUserLocationName, ...names.slice(0, 6)].forEach((name, i) => {
        expect(locations[i]).toHaveProperty("name", name);
      });
    });

    it("should not include locations that have a plus sign in the name", async () => {
      const names = ["New York", "London+City"];
      setMockPlacesNearby(setMockResponse({ names }));
      setMockReverseGeocode(setMockResponse({ nameKey: "formatted_address", names: ["Tel Aviv"] }));
      const locations = await locationService.getUserSurroundingLocations(1, 1);
      expect(locations).toHaveLength(2);
      expect(locations[0]).toHaveProperty("name", "Tel Aviv");
      expect(locations[1]).toHaveProperty("name", "New York");
    });
  });

  describe("getLocationBySearchTerm", () => {
    let locationService: any;

    function setMockPredictionResponse({
      isNoResults = false,
      names = ["New York"],
    }: {
      isNoResults?: boolean;
      names?: string[];
    }) {
      const getPredictionItem = (name: string, idx: number) => ({
        description: name,
        place_id: (idx + 1).toString(),
      });
      const predictions: any = names.map(getPredictionItem);
      return isNoResults ? { json: { predictions: [] } } : { json: { predictions } };
    }

    function setMockPlaceResponse(num: number) {
      const geometry = { location: { lat: num, lng: num } };
      return { json: { result: { geometry } } };
    }

    // used to mock the google maps client in getLocationBySearchTerm
    function setMockPlacesAutoComplete(mockedResponse: any) {
      mockPlacesAutoComplete.mockReturnValueOnce({
        asPromise: jest.fn().mockResolvedValue(mockedResponse),
      });
    }

    // used to mock the google maps client in _setCoordsToPrecditedLocations
    function setMockPlace(mockedResponse: any) {
      mockPlace.mockReturnValueOnce({
        asPromise: jest.fn().mockResolvedValue(mockedResponse),
      });
    }

    beforeEach(() => {
      jest.clearAllMocks();
      jest.doMock("@google/maps", () => ({
        createClient: () => createMockGoogleMapsClient(),
      }));

      locationService = require("./LocationService").default;
    });

    it("should return locations based on search term", async () => {
      setMockPlacesAutoComplete(setMockPredictionResponse({ names: ["New York", "London"] }));
      setMockPlace(setMockPlaceResponse(1));
      setMockPlace(setMockPlaceResponse(2));
      const locations = await locationService.getLocationBySearchTerm("New");
      expect(mockPlacesAutoComplete).toHaveBeenCalledTimes(1);
      expect(mockPlace).toHaveBeenCalledTimes(2);
      expect(locations).toHaveLength(2);
      expect(locations[0]).toEqual({
        name: "New York",
        placeId: "1",
        lat: 1,
        lng: 1,
      });
      expect(locations[1]).toEqual({
        name: "London",
        placeId: "2",
        lat: 2,
        lng: 2,
      });
    });

    it("should return empty array when there are no predictions", async () => {
      setMockPlacesAutoComplete(setMockPredictionResponse({ isNoResults: true }));
      const locations = await locationService.getLocationBySearchTerm("New");
      expect(mockPlacesAutoComplete).toHaveBeenCalledTimes(1);
      expect(mockPlace).toHaveBeenCalledTimes(0);
      expect(locations).toEqual([]);
    });

    it("should handle errors from placesAutoComplete", async () => {
      mockPlacesAutoComplete.mockReturnValueOnce({
        asPromise: jest.fn().mockRejectedValue(new Error("Test error")),
      });
      await expect(locationService.getLocationBySearchTerm("New")).rejects.toThrow("Test error");
    });

    it("should handle errors from place", async () => {
      setMockPlacesAutoComplete(setMockPredictionResponse({ names: ["New York"] }));
      mockPlace.mockReturnValueOnce({
        asPromise: jest.fn().mockRejectedValue(new Error("Test error")),
      });
      await expect(locationService.getLocationBySearchTerm("New")).rejects.toThrow("Test error");
    });
  });
});
