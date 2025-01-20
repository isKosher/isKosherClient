import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface CityFilterProps {
  onSelectCity: (city: string) => void;
  loading: boolean;
}

const CityFilter: React.FC<CityFilterProps> = ({ onSelectCity, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  let resource_id = "5c78e9fa-c2e2-4771-93ff-7f400a12f7ba";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          "https://data.gov.il/api/3/action/package_search?q=%D7%A8%D7%A9%D7%99%D7%9E%D7%AA%20%D7%99%D7%A9%D7%95%D7%91%D7%99%D7%9D&rows=20"
        );
        let fetchedId = data.result.results[0].resources[0].id;
        if (fetchedId) resource_id = fetchedId;
      } catch (error) {
        console.error("Error fetching resource_id:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const fetchCities = async () => {
        try {
          const { data } = await axios.get(
            `https://data.gov.il/api/3/action/datastore_search?resource_id=${resource_id}&q=${searchTerm}`
          );
          const cityNames = data.result.records.map(
            (record: any) => record["שם_ישוב"]
          );
          setCities(cityNames);
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };

      fetchCities();
    } else {
      setCities([]);
    }
  }, [searchTerm]);

  const handleSelectCity = (city: string) => {
    setSearchTerm(city);
    setIsDropdownOpen(false);
    onSelectCity(city);
  };

  return (
    <div className="relative">
      <Input
        className="w-full p-6 text-md lg:text-lg border-2 border-[#1A365D]/20 rounded-lg hebrew-side"
        placeholder="חפש עיר"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsDropdownOpen(true);
        }}
        disabled={loading}
      />
      {isDropdownOpen && cities.length > 0 && (
        <ul
          dir="rtl"
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto"
        >
          {cities.map((city) => (
            <li
              key={city}
              dir="rtl"
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleSelectCity(city)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityFilter;
