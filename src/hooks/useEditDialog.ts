import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { UserOwnedBusinessResponse } from "@/types";
import type { EditSection } from "@/constants/dashboard";

interface UseEditDialogReturn {
  editDialogOpen: boolean;
  editSection: EditSection;
  setEditDialogOpen: (open: boolean) => void;
  setEditSection: (section: EditSection) => void;
  handleEditSection: (business: UserOwnedBusinessResponse, section: EditSection) => void;
  handleDialogClose: (refreshData?: boolean, message?: string) => void;
}

interface UseEditDialogProps {
  onBusinessSelect: (business: UserOwnedBusinessResponse) => void;
  onRefreshData: () => Promise<void>;
}

export function useEditDialog({ onBusinessSelect, onRefreshData }: UseEditDialogProps): UseEditDialogReturn {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSection, setEditSection] = useState<EditSection>("details");

  const handleEditSection = useCallback(
    (business: UserOwnedBusinessResponse, section: EditSection) => {
      onBusinessSelect(business);
      setEditSection(section);
      setEditDialogOpen(true);
    },
    [onBusinessSelect]
  );

  const handleDialogClose = useCallback(
    async (refreshData = false, message?: string) => {
      setEditDialogOpen(false);
      if (refreshData) {
        await onRefreshData();
        if (message) {
          toast.success(message);
        }
      }
    },
    [onRefreshData]
  );

  return {
    editDialogOpen,
    editSection,
    setEditDialogOpen,
    setEditSection,
    handleEditSection,
    handleDialogClose,
  };
}
