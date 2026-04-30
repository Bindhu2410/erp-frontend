import React, { useEffect, useState } from "react";
import axios from "axios";

interface LocationData {
  id: number;
  name: string;
  code?: string;
  countryId?: number;
  territoryId?: number;
  areaId?: number;
}

interface LocationSelectorProps {
  onLocationChange: (data: {
    country: LocationData | null;
    state: LocationData | null;
    territory: LocationData | null;
    district: LocationData | null;
    area: LocationData | null;
    pincode: string;
  }) => void;
  initialData?: {
    countryId?: number;
    stateId?: number;
    territoryId?: number;
    districtId?: number;
    areaId?: number;
    pincode?: string;
  };
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationChange,
  initialData,
}) => {
  const [countries, setCountries] = useState<LocationData[]>([]);
  const [states, setStates] = useState<LocationData[]>([]);
  const [territories, setTerritories] = useState<LocationData[]>([]);
  const [districts, setDistricts] = useState<LocationData[]>([]);
  const [areas, setAreas] = useState<LocationData[]>([]);
  const [pincodes, setPincodes] = useState<string[]>([]);

  const [selectedCountry, setSelectedCountry] = useState<LocationData | null>(
    null
  );
  const [selectedState, setSelectedState] = useState<LocationData | null>(null);
  const [selectedTerritory, setSelectedTerritory] =
    useState<LocationData | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<LocationData | null>(
    null
  );
  const [selectedArea, setSelectedArea] = useState<LocationData | null>(null);
  const [selectedPincode, setSelectedPincode] = useState("");

  const [pincodeSuggestions, setPincodeSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [countriesRes, statesRes, territoriesRes, districtsRes] =
        await Promise.all([
          axios.get("${process.env.REACT_APP_API_BASE_URL}/SalesCountry"),
          axios.get("${process.env.REACT_APP_API_BASE_URL}/SalesState"),
          axios.get("${process.env.REACT_APP_API_BASE_URL}/SalesTerritory"),
          axios.get("${process.env.REACT_APP_API_BASE_URL}/SalesDistrict"),
        ]);

      setCountries(countriesRes.data);
      setStates(statesRes.data);
      setTerritories(territoriesRes.data);
      setDistricts(districtsRes.data);

      // Set initial values if provided
      if (initialData) {
        // ... handle setting initial values
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeSearch = async (value: string) => {
    if (value.length >= 3) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/SalesPincode`
        );
        const filteredPincodes = response.data
          .filter((p: any) => p.code.startsWith(value))
          .map((p: any) => p.code);
        setPincodeSuggestions(filteredPincodes);
      } catch (error) {
        console.error("Error searching pincodes:", error);
      }
    } else {
      setPincodeSuggestions([]);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Country Selector */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <select
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          value={selectedCountry?.id || ""}
          onChange={async (e) => {
            const country = countries.find(
              (c) => c.id === Number(e.target.value)
            );
            setSelectedCountry(country || null);
            if (country) {
              const statesRes = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/SalesState/country/${country.id}`
              );
              setStates(statesRes.data);
            }
          }}
        >
          <option value="">Select Country</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pincode Autocomplete */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pincode
        </label>
        <input
          type="text"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          value={selectedPincode}
          onChange={(e) => {
            setSelectedPincode(e.target.value);
            handlePincodeSearch(e.target.value);
          }}
          placeholder="Enter pincode"
        />
        {pincodeSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {pincodeSuggestions.map((pincode) => (
              <div
                key={pincode}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-orange-50"
                onClick={() => {
                  setSelectedPincode(pincode);
                  setPincodeSuggestions([]);
                }}
              >
                {pincode}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Similar select components for State, Territory, District, and Area */}
      {/* ... Add more select components following the same pattern ... */}

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
