import { useState, useCallback } from "react";
import { toast } from "sonner";
import { getMyBusinessAction } from "@/app/actions/dashboardAction";
import type { UserOwnedBusinessResponse } from "@/types";

interface UseBusinessManagementReturn {
  businesses: UserOwnedBusinessResponse[];
  selectedBusiness: UserOwnedBusinessResponse | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  filteredBusinesses: UserOwnedBusinessResponse[];
  setSearchTerm: (term: string) => void;
  setSelectedBusiness: (business: UserOwnedBusinessResponse | null) => void;
  refreshBusinessData: () => Promise<void>;
  fetchInitialBusinesses: () => Promise<void>;
}

export function useBusinessManagement(): UseBusinessManagementReturn {
  const [businesses, setBusinesses] = useState<UserOwnedBusinessResponse[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<UserOwnedBusinessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBusinesses = businesses.filter((business) =>
    business.business_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const refreshBusinessData = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedBusinesses = await getMyBusinessAction();
      setBusinesses(fetchedBusinesses);

      // Update selected business if it exists
      if (selectedBusiness) {
        const updatedBusiness = fetchedBusinesses.find((b) => b.business_id === selectedBusiness.business_id);
        if (updatedBusiness) {
          setSelectedBusiness(updatedBusiness);
        }
      }
      setError(null);
    } catch (err) {
      console.error("Failed to refresh business data:", err);
      setError("Failed to refresh your businesses. Please try again later.");
      toast.error("שגיאה בטעינת הנתונים");
    } finally {
      setIsLoading(false);
    }
  }, [selectedBusiness]);

  const fetchInitialBusinesses = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedBusinesses = await getMyBusinessAction();
      setBusinesses(fetchedBusinesses);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch user businesses:", err);
      setError("Failed to load your businesses. Please try again later.");
      toast.error("שגיאה בטעינת העסקים");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    businesses,
    selectedBusiness,
    isLoading,
    error,
    searchTerm,
    filteredBusinesses,
    setSearchTerm,
    setSelectedBusiness,
    refreshBusinessData,
    fetchInitialBusinesses,
  };
}
