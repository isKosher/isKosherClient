import React from "react";
import { ImageIcon, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BusinessesAdminSearch from "@/components/businesses-admin-search";
import BusinessesAdminListSkeleton from "@/components/businesses-admin-list-skeleton";
import BusinessesAdminError from "@/components/businesses-admin-error";
import { BusinessCard } from "./BusinessCard";
import type { UserOwnedBusinessResponse } from "@/types";
import type { EditSection } from "@/constants/dashboard";
import { DASHBOARD_CONSTANTS } from "@/constants/dashboard";

interface BusinessListProps {
  businesses: UserOwnedBusinessResponse[];
  selectedBusiness: UserOwnedBusinessResponse | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onBusinessSelect: (business: UserOwnedBusinessResponse) => void;
  onBusinessEdit: (business: UserOwnedBusinessResponse, section: EditSection) => void;
  onRetry: () => void;
}

const NoBusinessesMessage = React.memo(() => (
  <div className="flex flex-col items-center justify-center py-10 opacity-80">
    <ImageIcon className={`w-10 h-10 ${DASHBOARD_CONSTANTS.COLORS.SKY_300} mb-3`} />
    <div className={`text-lg font-semibold ${DASHBOARD_CONSTANTS.COLORS.PRIMARY} mb-1`}>לא נמצאו עסקים</div>
    <div className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} text-sm mb-3`}>
      נסה לשנות את מילות החיפוש או להוסיף עסק חדש
    </div>
    <Button asChild variant="outline" size="sm" className={`${DASHBOARD_CONSTANTS.COLORS.PRIMARY} border-sky-200`}>
      <Link href="/dashboard/create-business">
        <Plus className="h-4 w-4 ml-1" /> הוסף עסק חדש
      </Link>
    </Button>
  </div>
));

NoBusinessesMessage.displayName = "NoBusinessesMessage";

export const BusinessList = React.memo<BusinessListProps>(
  ({
    businesses,
    selectedBusiness,
    isLoading,
    error,
    searchTerm,
    onSearchChange,
    onBusinessSelect,
    onBusinessEdit,
    onRetry,
  }) => {
    const filteredBusinesses = businesses.filter((business) =>
      business.business_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="w-full lg:w-1/3">
        <div className="sticky top-4">
          <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
            <h3 className={`text-xl font-medium text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}]`}>העסקים שלי</h3>
            <div className="flex gap-2 items-center">
              <BusinessesAdminSearch value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
              <Button
                asChild
                variant="outline"
                size="sm"
                className={`text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}] border-sky-200`}
              >
                <Link href="/dashboard/create-business">
                  <Plus className="h-4 w-4 ml-1" /> הוסף עסק
                </Link>
              </Button>
            </div>
          </div>

          <div className={`space-y-4 max-h-[${DASHBOARD_CONSTANTS.MAX_VIEWPORT_HEIGHT}] overflow-y-auto pr-2`}>
            {!isLoading && !error && filteredBusinesses.length === 0 && <NoBusinessesMessage />}

            {error ? (
              <BusinessesAdminError message={error} onRetry={onRetry} />
            ) : isLoading ? (
              <BusinessesAdminListSkeleton />
            ) : (
              filteredBusinesses.map((business) => (
                <BusinessCard
                  key={business.business_id}
                  business={business}
                  isSelected={selectedBusiness?.business_id === business.business_id}
                  onSelect={onBusinessSelect}
                  onEdit={onBusinessEdit}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
);

BusinessList.displayName = "BusinessList";
