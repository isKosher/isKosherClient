"use client";

import { fetchLookupDataAction } from "@/services/lookup-service";
import { Option } from "@/types";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

// Types
export interface LookupData {
  food_types: Array<{ id: string; name: string }>;
  business_types: Array<{ id: string; name: string }>;
  kosher_types: Array<{ id: string; name: string; kosher_icon_url: string }>;
  food_item_types: Array<{ id: string; name: string }>;
}

interface LookupContextType {
  // Data
  lookupData: LookupData;
  businessTypes: Option[];
  kosherTypes: Option[];
  foodItems: Option[];

  // State
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  refreshData: () => Promise<void>;
  addCustomBusinessType: (name: string) => Option;
  addCustomKosherType: (name: string) => Option;
  addCustomFoodItem: (name: string) => Option;
}

const LookupContext = createContext<LookupContextType | undefined>(undefined);

// Custom hook to use the context
export function useLookupData() {
  const context = useContext(LookupContext);
  if (context === undefined) {
    throw new Error("useLookupData must be used within a LookupProvider");
  }
  return context;
}

interface LookupProviderProps {
  children: React.ReactNode;
  initialData?: LookupData;
}

export function LookupProvider({ children, initialData }: LookupProviderProps) {
  const [lookupData, setLookupData] = useState<LookupData>(
    initialData || {
      food_types: [],
      business_types: [],
      kosher_types: [],
      food_item_types: [],
    }
  );

  const [businessTypes, setBusinessTypes] = useState<Option[]>([]);
  const [kosherTypes, setKosherTypes] = useState<Option[]>([]);
  const [foodItems, setFoodItems] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isInitialized, setIsInitialized] = useState(!!initialData);
  const [error, setError] = useState<string | null>(null);

  // Transform lookup data to options
  const transformLookupData = useCallback((data: LookupData) => {
    setBusinessTypes(
      data.business_types.map((item) => ({
        id: item.id,
        name: item.name,
        isCustom: false,
      }))
    );

    setKosherTypes(
      data.kosher_types.map((item) => ({
        id: item.id,
        name: item.name,
        isCustom: false,
      }))
    );

    setFoodItems(
      data.food_item_types.map((item) => ({
        id: item.id,
        name: item.name,
        isCustom: false,
      }))
    );
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchLookupDataAction();
      setLookupData(data);
      transformLookupData(data);
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = "שגיאה בטעינת הנתונים";
      setError(errorMessage);

      toast.error(errorMessage, {
        description: "לא ניתן לטעון את רשימת האפשרויות. אנא נסה שוב מאוחר יותר.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [transformLookupData]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Add custom options functions
  const addCustomBusinessType = useCallback((name: string): Option => {
    const newType: Option = {
      id: `custom-business-${Date.now()}`,
      name,
      isCustom: true,
    };
    setBusinessTypes((prev) => [...prev, newType]);
    return newType;
  }, []);

  const addCustomKosherType = useCallback((name: string): Option => {
    const newType: Option = {
      id: `custom-kosher-${Date.now()}`,
      name,
      isCustom: true,
    };
    setKosherTypes((prev) => [...prev, newType]);
    return newType;
  }, []);

  const addCustomFoodItem = useCallback((name: string): Option => {
    const newItem: Option = {
      id: `custom-food-${Date.now()}`,
      name,
      isCustom: true,
    };
    setFoodItems((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  // Initialize data on mount (only if no initial data)
  useEffect(() => {
    if (!initialData && !isInitialized) {
      fetchData();
    } else if (initialData) {
      transformLookupData(initialData);
    }
  }, [initialData, isInitialized, fetchData, transformLookupData]);

  const contextValue: LookupContextType = {
    lookupData,
    businessTypes,
    kosherTypes,
    foodItems,
    isLoading,
    isInitialized,
    error,
    refreshData,
    addCustomBusinessType,
    addCustomKosherType,
    addCustomFoodItem,
  };

  return <LookupContext.Provider value={contextValue}>{children}</LookupContext.Provider>;
}
