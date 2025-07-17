"use client";
import { useCallback, useEffect } from "react";
import { Building } from "lucide-react";
import type { UserOwnedBusinessResponse } from "@/types";
import { useBusinessManagement } from "@/hooks/useBusinessManagement";
import { useEditDialog } from "@/hooks/useEditDialog";
import { BusinessList } from "@/components/dashboard/BusinessList";
import { BusinessDetails } from "@/components/dashboard/BusinessDetails";
import { EditDialog } from "@/components/dashboard/EditDialog";

export default function DashboardClient() {
  const {
    businesses,
    isLoading,
    error,
    selectedBusiness,
    searchTerm,
    refreshBusinessData,
    setSelectedBusiness,
    setSearchTerm,
    fetchInitialBusinesses,
  } = useBusinessManagement();

  const handleBusinessSelect = useCallback(
    (business: UserOwnedBusinessResponse) => {
      setSelectedBusiness(business);
    },
    [setSelectedBusiness]
  );

  const { editDialogOpen, editSection, handleEditSection, handleDialogClose } = useEditDialog({
    onBusinessSelect: handleBusinessSelect,
    onRefreshData: refreshBusinessData,
  });

  useEffect(() => {
    fetchInitialBusinesses();
  }, [fetchInitialBusinesses]);

  return (
    <div className="min-h-screen bg-gray-50 lg:mt-0 mt-10" dir="rtl">
      <div className="mx-auto px-4 py-8 md:py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-serif text-[#1A365D] font-bold mb-2">לוח הבקרה שלי</h2>
            <p className="text-[#2D4A6D] text-md lg:text-lg">נהל את העסקים שלך</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <BusinessList
              businesses={businesses}
              selectedBusiness={selectedBusiness}
              isLoading={isLoading}
              error={error}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onBusinessSelect={handleBusinessSelect}
              onBusinessEdit={handleEditSection}
              onRetry={refreshBusinessData}
            />

            {selectedBusiness ? (
              <BusinessDetails selectedBusiness={selectedBusiness} onEdit={handleEditSection} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Building className="h-12 w-12 text-[#1A365D] opacity-30 mb-4" />
                <h3 className="text-lg font-medium text-[#1A365D]">בחר עסק לצפייה</h3>
                <p className="text-[#2D4A6D] mt-1">לחץ על אחד העסקים מהרשימה כדי לצפות בפרטים ולערוך</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditDialog
        isOpen={editDialogOpen}
        onOpenChange={(open) => !open && handleDialogClose()}
        selectedBusiness={selectedBusiness}
        editSection={editSection}
        onClose={handleDialogClose}
      />
    </div>
  );
}
