"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, SearchIcon, XCircle } from "lucide-react";
import type { BusinessSearchResult } from "@/types";
import { getSearchTrem } from "@/app/actions/getRestaurantAction";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<BusinessSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const minChars = 2;

  useOnClickOutside(searchRef, () => {
    setShowResults(false);
  });

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowResults(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  useEffect(() => {
    const isValidSearchTerm = (term: string) => /^[\u0590-\u05FFa-zA-Z0-9\s]+$/.test(term);

    if (!isValidSearchTerm(searchTerm) || searchTerm.length < minChars) {
      setSearchResults([]);
      if (searchTerm.length === 0) {
        setShowResults(false);
      }
      return;
    }

    if (searchTerm.length >= minChars) {
      setShowResults(true);
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await getSearchTrem(searchTerm);

        const sortedResults = data
          .filter((business: BusinessSearchResult) => business.match_score != null && !isNaN(business.match_score))
          .map((business: BusinessSearchResult) => ({
            ...business,
            match_score: Number.parseFloat(business.match_score.toString()),
          }))
          .sort((a: BusinessSearchResult, b: BusinessSearchResult) => b.match_score - a.match_score)
          .slice(0, 50);

        setSearchResults(sortedResults);

        if (sortedResults.length > 0) {
          setShowResults(true);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleResultClick = (businessId: string) => {
    setShowResults(false);
    setSearchTerm("");
    setTimeout(() => {
      router.push(`/business/${businessId}`);
    }, 0);
  };

  const clearSearch = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const renderSearchResults = () => {
    if (loading) {
      return (
        <div className="space-y-2 py-2">
          {[1, 2, 3].map((index) => (
            <div key={index} className="flex items-start gap-2 px-4 py-2">
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ))}
        </div>
      );
    }

    if (searchResults.length === 0 && searchTerm.length >= minChars) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-gray-500">לא נמצאו תוצאות ל-{searchTerm}</p>
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <ScrollArea className="max-h-96 overflow-y-auto">
          {searchResults.map((restaurant) => (
            <div
              key={restaurant.business_id}
              className="p-4 hover:bg-gray-100 cursor-pointer flex flex-col border-b border-gray-100 last:border-0 transition-colors duration-200"
              onClick={() => handleResultClick(restaurant.business_id)}
            >
              <p className="font-bold text-lg">{restaurant.business_name}</p>
              <p className="text-sm text-gray-600">
                {restaurant.address}, {restaurant.city}
              </p>
            </div>
          ))}
        </ScrollArea>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <SearchIcon className="h-12 w-12 text-gray-300 mb-2" />
        <p className="text-gray-500">הזן לפחות {minChars} תווים לחיפוש</p>
      </div>
    );
  };

  return (
    <div ref={searchRef} className="relative w-full text-right">
      <div className="relative">
        <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />

        <Input
          ref={inputRef}
          dir="rtl"
          className="w-full pr-10 pl-10 py-6 text-md rounded-full border border-gray-300 focus-visible:ring-indigo-500"
          placeholder="חפש לפי מיקום או שם בית עסק..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchTerm.length >= minChars) {
              setShowResults(true);
            }
          }}
        />

        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2"
            onClick={clearSearch}
          >
            <XCircle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </Button>
        )}

        {loading && (
          <div className="absolute left-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        )}
      </div>

      {showResults && (
        <div ref={resultsRef} className="absolute w-full mt-1 z-50" style={{ maxHeight: "70vh" }}>
          <Card className="w-full border border-gray-200 shadow-lg">
            <CardContent className="p-0">{renderSearchResults()}</CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
