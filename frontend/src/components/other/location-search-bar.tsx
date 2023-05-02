import React, { useState, useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { utilService } from "../../services/util.service/utils.service";

export const LocationSearch = () => {
  const apiKey = ""; // Your API key
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader.load().then(() => {
      const map = new google.maps.Map(document.createElement("div")); // Create a dummy map
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      placesServiceRef.current = new google.maps.places.PlacesService(map);
    });
  }, [apiKey]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInput(query);

    if (query) {
      autocompleteServiceRef.current?.getPlacePredictions(
        { input: query },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            setSuggestions(predictions || []);
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = () => {};

  return (
    <div>
      <input
        type="text"
        // value={input}
        onChange={utilService.debounce(handleInputChange, 2000)}
        placeholder="Search for a location"
      />
      <ul>
        {suggestions.map((suggestion) => (
          <li key={suggestion.place_id}>{suggestion.description}</li>
        ))}
      </ul>
    </div>
  );
};
