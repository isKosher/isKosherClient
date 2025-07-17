import React from "react";
import { Building, Edit, FileText, ImageIcon, MapPin, MoreHorizontal, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserOwnedBusinessResponse } from "@/types";
import type { EditSection } from "@/constants/dashboard";
import { DASHBOARD_CONSTANTS } from "@/constants/dashboard";

interface BusinessCardProps {
  business: UserOwnedBusinessResponse;
  isSelected: boolean;
  onSelect: (business: UserOwnedBusinessResponse) => void;
  onEdit: (business: UserOwnedBusinessResponse, section: EditSection) => void;
}

export const BusinessCard = React.memo<BusinessCardProps>(({ business, isSelected, onSelect, onEdit }) => {
  const handleCardClick = () => {
    onSelect(business);
  };

  const handleEditClick = (section: EditSection) => {
    onEdit(business, section);
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-sky-300 ${
        isSelected
          ? DASHBOARD_CONSTANTS.STYLES.BUSINESS_CARD_SELECTED
          : DASHBOARD_CONSTANTS.STYLES.BUSINESS_CARD_DEFAULT
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className={`text-lg ${DASHBOARD_CONSTANTS.COLORS.PRIMARY}`}>{business.business_name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(DASHBOARD_CONSTANTS.EDIT_SECTIONS.DETAILS);
                }}
              >
                <Edit className="ml-2 h-4 w-4" /> ערוך פרטים
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(DASHBOARD_CONSTANTS.EDIT_SECTIONS.KOSHER);
                }}
              >
                <Star className="ml-2 h-4 w-4" /> ערוך כשרות
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(DASHBOARD_CONSTANTS.EDIT_SECTIONS.SUPERVISORS);
                }}
              >
                <Users className="ml-2 h-4 w-4" /> ערוך משגיחים
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(DASHBOARD_CONSTANTS.EDIT_SECTIONS.CERTIFICATES);
                }}
              >
                <FileText className="ml-2 h-4 w-4" /> ערוך תעודות
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(DASHBOARD_CONSTANTS.EDIT_SECTIONS.PHOTOS);
                }}
              >
                <ImageIcon className="ml-2 h-4 w-4" /> ערוך תמונות
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className={`${DASHBOARD_CONSTANTS.COLORS.SECONDARY} text-sm space-y-1`}>
          <div className="flex items-center">
            <Building className="h-3.5 w-3.5 ml-1" />
            <span>{business.business_type}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-3.5 w-3.5 ml-1" />
            <span>
              {business.location.address} {business.location.street_number}, {business.location.city}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardFooter className="pt-0 pb-3">
        <div className="flex flex-wrap gap-1">
          {business.kosher_types.slice(0, 2).map((type) => (
            <Badge key={type.id} variant="outline" className={DASHBOARD_CONSTANTS.STYLES.BADGE_PRIMARY}>
              {type.name}
            </Badge>
          ))}
          {business.kosher_types.length > 2 && (
            <Badge variant="outline" className={DASHBOARD_CONSTANTS.STYLES.BADGE_PRIMARY}>
              +{business.kosher_types.length - 2}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
});

BusinessCard.displayName = "BusinessCard";
