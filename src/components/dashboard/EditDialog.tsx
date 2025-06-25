import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditFormRenderer } from "./EditFormRenderer";
import type { UserOwnedBusinessResponse } from "@/types";
import type { EditSection } from "@/constants/dashboard";
import { DASHBOARD_CONSTANTS } from "@/constants/dashboard";

interface EditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBusiness: UserOwnedBusinessResponse | null;
  editSection: EditSection;
  onClose: (refreshData?: boolean, message?: string) => void;
}

const getDialogTitle = (editSection: EditSection): string => {
  switch (editSection) {
    case DASHBOARD_CONSTANTS.EDIT_SECTIONS.DETAILS:
      return "עריכת פרטי עסק";
    case DASHBOARD_CONSTANTS.EDIT_SECTIONS.KOSHER:
      return "עריכת פרטי כשרות";
    case DASHBOARD_CONSTANTS.EDIT_SECTIONS.SUPERVISORS:
      return "עריכת משגיחים";
    case DASHBOARD_CONSTANTS.EDIT_SECTIONS.CERTIFICATES:
      return "עריכת תעודות";
    case DASHBOARD_CONSTANTS.EDIT_SECTIONS.PHOTOS:
      return "עריכת תמונות";
    default:
      return "עריכה";
  }
};

export const EditDialog = React.memo<EditDialogProps>(
  ({ isOpen, onOpenChange, selectedBusiness, editSection, onClose }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl max-h-[100vh] overflow-y-auto">
          <DialogHeader className="text-right sm:text-center">
            <DialogTitle className={`text-[${DASHBOARD_CONSTANTS.COLORS.PRIMARY}]`}>
              {getDialogTitle(editSection)}
            </DialogTitle>
            <DialogDescription className={`text-[${DASHBOARD_CONSTANTS.COLORS.SECONDARY}]`}>
              {selectedBusiness?.business_name}
            </DialogDescription>
          </DialogHeader>
          <EditFormRenderer selectedBusiness={selectedBusiness} editSection={editSection} onClose={onClose} />
        </DialogContent>
      </Dialog>
    );
  }
);

EditDialog.displayName = "EditDialog";
