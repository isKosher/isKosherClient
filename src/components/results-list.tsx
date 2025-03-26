import { BusinessPreview } from "@/types";
import GpsSearchAnimation from "./gpsSearchAnimation";
import { Button } from "./ui/button";
import RestaurantCard from "@/components/restaurantCard";

interface ResultsListProps {
  results: BusinessPreview[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  loadMoreRef: React.RefCallback<HTMLDivElement>;
  hasMore: boolean;
  page: number;
}

export default function ResultsList({
  results,
  isLoading,
  hasActiveFilters,
  resetFilters,
  loadMoreRef,
  hasMore,
  page,
}: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="self-center h-60 w-60 mx-auto">
        <GpsSearchAnimation />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 bg-white bg-opacity-70 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg p-6">
        <p className="text-2xl text-gray-600">לא נמצאו תוצאות</p>
        {hasActiveFilters && (
          <Button className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={resetFilters}>
            נקה סינון ונסה שוב
          </Button>
        )}
      </div>
    );
  }

  // Assuming equal distribution of items per page
  const itemsPerPage = Math.floor(results.length / page);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mx-4">
        {results.map((result, index) => {
          // Calculate relative index per page so that animation restarts from 0 for new results.
          const relativeIndex = index - (page - 1) * itemsPerPage;
          return (
            <div
              key={result.business_id}
              className="animate-fadeInUp opacity-0"
              style={{ animationDelay: `${relativeIndex * 0.1}s` }}
            >
              <RestaurantCard restaurant={result} />
            </div>
          );
        })}

        {hasMore && (
          <div ref={loadMoreRef} className="col-span-full self-center h-60 w-60 mx-auto">
            <GpsSearchAnimation />
          </div>
        )}
      </div>
    </>
  );
}
