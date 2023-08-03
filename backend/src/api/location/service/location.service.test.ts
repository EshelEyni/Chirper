import { GoogleMapsClientWithPromise } from "@google/maps";

const mockPlacesNearby = jest.fn();
const mockReverseGeocode = jest.fn();

const createMockGoogleMapsClient = (): GoogleMapsClientWithPromise =>
  ({
    placesNearby: mockPlacesNearby,
    reverseGeocode: mockReverseGeocode,
  } as any);

describe("Location Service", () => {
  let locationService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.doMock("@google/maps", () => ({
      createClient: () => createMockGoogleMapsClient(),
    }));

    locationService = require("./location.service").default;
  });

  it("should get user surrounding locations", async () => {
    // Set up your mocks for this test
    const res = {
      json: {
        results: [
          {
            name: "Test Location",
            place_id: "1",
            geometry: { location: { lat: 1, lng: 1 } },
          },
        ],
      },
    };
    mockPlacesNearby.mockReturnValueOnce({
      asPromise: jest.fn().mockResolvedValue(res),
    });

    const res2 = {
      json: {
        results: [
          {
            formatted_address: "Test Address",
            place_id: "1",
            geometry: { location: { lat: 1, lng: 1 } },
          },
        ],
      },
    };
    mockReverseGeocode.mockReturnValueOnce({
      asPromise: jest.fn().mockResolvedValue(res2),
    });

    const locations = await locationService.getUserSurroundingLocations(1, 1);
    expect(locations).toHaveLength(2);
    expect(locations[0]).toHaveProperty("name", "Test Address");
    expect(locations[1]).toHaveProperty("name", "Test Location");
  });

  // Other tests...
});
