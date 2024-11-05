"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Star, Clock, Phone } from "lucide-react";

const KosherFinder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCertification, setSelectedCertification] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [loading, setLoading] = useState(false);

  const certifications = [
    "All Certifications",
    "OU Kosher",
    "OK Kosher",
    "Star-K",
    "CRC",
    "Kof-K",
  ];

  const cuisineTypes = [
    "All Cuisines",
    "Israeli",
    "Middle Eastern",
    "American",
    "Deli",
    "Pizza",
    "Sushi",
    "Mediterranean",
  ];

  const handleSearch = () => {
    setLoading(true);
    // Simulate a search request with a delay
    setTimeout(() => {
      setLoading(false);
      // Logic to perform search goes here
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#EDF2F7]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-serif text-[#1A365D] font-bold">
              isKosher
            </h1>
            <div className="space-x-6">
              <Button variant="ghost" className="text-[#1A365D]">
                HOME
              </Button>
              <Button variant="ghost" className="text-[#1A365D]">
                ABOUT
              </Button>
              <Button variant="ghost" className="text-[#1A365D]">
                RESTAURANTS
              </Button>
              <Button variant="ghost" className="text-[#1A365D]">
                CONTACT
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen bg-cover bg-center ">
        <div className="mx-auto px-4 py-16 bg-pattern">
          <div className="max-w-3xl mx-auto bg-white/95 rounded-lg shadow-xl p-8 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-serif text-[#1A365D] font-bold mb-2">
                isKosher
              </h2>
              <p className="text-[#2D4A6D] text-lg">
                PROFESSIONAL KOSHER RESTAURANTS
              </p>
            </div>

            {/* Search Filters */}
            <div className="space-y-4">
              {/* Location Search */}
              <Input
                className="w-full p-4 text-lg border-2 border-[#1A365D]/20 rounded-lg"
                placeholder="Enter Location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Certification Filter */}
                <Select
                  onValueChange={setSelectedCertification}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full p-4 text-lg border-2 border-[#1A365D]/20 rounded-lg">
                    <SelectValue placeholder="Select Certification" />
                  </SelectTrigger>
                  <SelectContent>
                    {certifications.map((cert) => (
                      <SelectItem key={cert} value={cert}>
                        {cert}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Cuisine Filter */}
                <Select onValueChange={setSelectedCuisine} disabled={loading}>
                  <SelectTrigger className="w-full p-4 text-lg border-2 border-[#1A365D]/20 rounded-lg">
                    <SelectValue placeholder="Select Cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineTypes.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Buttons */}
                <Button
                  className="w-full bg-[#1A365D] hover:bg-[#2D4A6D] text-white text-lg py-6"
                  onClick={() => alert("Go to background")}
                >
                  BACKGROUND
                </Button>
                <Button
                  className="w-full bg-[#1A365D] hover:bg-[#2D4A6D] text-white text-lg py-6"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? "Searching..." : "BEGIN"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern (optional for styling purposes) import bg.jpeg from public folder */}
      <style jsx global>{`
        .bg-pattern {
          background-color: #EDF2F7;
          background: url('/bg.jpeg');
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center center;
      `}</style>
    </div>
  );
};

export default KosherFinder;
