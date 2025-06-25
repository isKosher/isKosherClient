import React from "react";
import BusinessDetailsForm from "@/app/(private)/dashboard/(edit-business)/business-details-form";
import KosherTypesForm from "@/app/(private)/dashboard/(edit-business)/kosher-types-form";
import SupervisorsForm from "@/app/(private)/dashboard/(edit-business)/supervisors-form";
import CertificatesForm from "@/app/(private)/dashboard/(edit-business)/certificates-form";
import PhotosForm from "@/app/(private)/dashboard/(edit-business)/photos-form";
import type { UserOwnedBusinessResponse } from "@/types";
import type { EditSection } from "@/constants/dashboard";
import { DASHBOARD_CONSTANTS } from "@/constants/dashboard";

interface EditFormRendererProps {
  selectedBusiness: UserOwnedBusinessResponse | null;
  editSection: EditSection;
  onClose: (refreshData?: boolean, message?: string) => void;
}

export const EditFormRenderer = React.memo<EditFormRendererProps>(({ selectedBusiness, editSection, onClose }) => {
  if (!selectedBusiness) return null;

  switch (editSection) {
    case DASHBOARD_CONSTANTS.EDIT_SECTIONS.DETAILS:
      return <BusinessDetailsForm business={selectedBusiness} onClose={onClose} />;
    case DASHBOARD_CONSTANTS.EDIT_SECTIONS.KOSHER:
      return <KosherTypesForm business={selectedBusiness} onClose={onClose} />;
    case DASHBOARD_CONSTANTS.EDIT_SECTIONS.SUPERVISORS:
      return <SupervisorsForm business={selectedBusiness} onClose={onClose} />;
    case DASHBOARD_CONSTANTS.EDIT_SECTIONS.CERTIFICATES:
      return <CertificatesForm business={selectedBusiness} onClose={onClose} />;
    case DASHBOARD_CONSTANTS.EDIT_SECTIONS.PHOTOS:
      return <PhotosForm business={selectedBusiness} onClose={onClose} />;
    default:
      return null;
  }
});

EditFormRenderer.displayName = "EditFormRenderer";
