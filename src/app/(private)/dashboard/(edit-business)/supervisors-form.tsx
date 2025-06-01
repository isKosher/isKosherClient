"use client";
import type React from "react";
import { useState } from "react";
import type { UserOwnedBusinessResponse } from "@/types";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateBusinessSupervisor,
  deleteBusinessSupervisor,
  addBusinessSupervisor,
} from "@/app/actions/dashboardAction";

type SupervisorsFormProps = {
  business: UserOwnedBusinessResponse;
  onClose: (refreshData?: boolean, message?: string) => void;
};

type Supervisor = {
  id: string;
  name: string;
  authority: string;
  contact_info: string;
};

export default function SupervisorsForm({ business, onClose }: SupervisorsFormProps) {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([...business.supervisors]);
  const [newSupervisor, setNewSupervisor] = useState<Omit<Supervisor, "id">>({
    name: "",
    authority: "",
    contact_info: "",
  });
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{
    adding: boolean;
    editing: string | null;
    deleting: string | null;
  }>({
    adding: false,
    editing: null,
    deleting: null,
  });
  const [error, setError] = useState<string | null>(null);

  const handleAddSupervisor = async () => {
    if (!newSupervisor.name || !newSupervisor.authority || !newSupervisor.contact_info) {
      setError("יש למלא את כל השדות");
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, adding: true }));
      setError(null);

      const response = await addBusinessSupervisor({
        business_id: business.business_id,
        supervisor: newSupervisor,
      });

      if (!response.id) throw new Error("Failed to get supervisor ID");
      const addedSupervisor = { ...newSupervisor, id: response.id };
      setSupervisors((prev) => [...prev, addedSupervisor]);
      setNewSupervisor({ name: "", authority: "", contact_info: "" });
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add supervisor:", err);
      setError(err instanceof Error ? err.message : "שגיאה בהוספת משגיח");
    } finally {
      setLoadingStates((prev) => ({ ...prev, adding: false }));
    }
  };

  const handleUpdateSupervisor = async (supervisor: Supervisor) => {
    if (!supervisor.name || !supervisor.authority || !supervisor.contact_info) {
      setError("יש למלא את כל השדות");
      return;
    }

    try {
      setLoadingStates((prev) => ({ ...prev, editing: supervisor.id }));
      setError(null);

      await updateBusinessSupervisor({
        business_id: business.business_id,
        supervisor: {
          name: supervisor.name,
          authority: supervisor.authority,
          contact_info: supervisor.contact_info,
        },
      });

      setSupervisors((prev) => prev.map((s) => (s.id === supervisor.id ? supervisor : s)));
      setEditingSupervisor(null);
    } catch (err) {
      console.error("Failed to update supervisor:", err);
      setError(err instanceof Error ? err.message : "שגיאה בעדכון פרטי המשגיח");
    } finally {
      setLoadingStates((prev) => ({ ...prev, editing: null }));
    }
  };

  const handleDeleteSupervisor = async (supervisorId: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, deleting: supervisorId }));
      setError(null);
      await deleteBusinessSupervisor({
        business_id: business.business_id,
        supervisor_id: supervisorId,
      });

      setSupervisors((prev) => prev.filter((s) => s.id !== supervisorId));
    } catch (err) {
      console.error("Failed to delete supervisor:", err);
      setError(err instanceof Error ? err.message : "שגיאה במחיקת משגיח");
    } finally {
      setLoadingStates((prev) => ({ ...prev, deleting: null }));
    }
  };

  const handleEditClick = (supervisor: Supervisor) => {
    setEditingSupervisor({ ...supervisor });
  };

  const handleCancelEdit = () => {
    setEditingSupervisor(null);
    setError(null);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewSupervisor({ name: "", authority: "", contact_info: "" });
    setError(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <div className="flex justify-between items-center mb-4">
          <Label className="text-[#1A365D] text-lg">משגיחי כשרות</Label>
          {!isAdding && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-[#1A365D] border-sky-200"
              onClick={() => setIsAdding(true)}
              disabled={!!editingSupervisor}
            >
              <Plus className="h-4 w-4 ml-1" /> הוסף משגיח
            </Button>
          )}
        </div>

        {isAdding && (
          <Card className="border-sky-200 mb-4">
            <CardContent className="p-4 space-y-3">
              <div>
                <Label className="text-[#1A365D]">שם המשגיח</Label>
                <Input
                  placeholder="הזן את שם המשגיח"
                  className="border-sky-200 focus:border-sky-500 mt-1"
                  value={newSupervisor.name}
                  onChange={(e) => setNewSupervisor({ ...newSupervisor, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-[#1A365D]">רשות</Label>
                <Input
                  placeholder="הזן את שם הרשות"
                  className="border-sky-200 focus:border-sky-500 mt-1"
                  value={newSupervisor.authority}
                  onChange={(e) => setNewSupervisor({ ...newSupervisor, authority: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-[#1A365D]">פרטי קשר</Label>
                <Input
                  placeholder="הזן מספר טלפון"
                  className="border-sky-200 focus:border-sky-500 mt-1"
                  value={newSupervisor.contact_info}
                  onChange={(e) => setNewSupervisor({ ...newSupervisor, contact_info: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelAdd}
                  className="border-gray-300"
                  disabled={loadingStates.adding}
                >
                  ביטול
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#1A365D] hover:bg-[#2D4A6D]"
                  onClick={handleAddSupervisor}
                  disabled={loadingStates.adding}
                >
                  {loadingStates.adding ? (
                    <>
                      <span className="ml-2">מוסיף...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    </>
                  ) : (
                    "הוסף"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {supervisors.map((supervisor) => (
            <Card key={supervisor.id} className="border-sky-200">
              <CardContent className="p-4">
                {editingSupervisor?.id === supervisor.id ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-[#1A365D]">שם המשגיח</Label>
                      <Input
                        className="border-sky-200 focus:border-sky-500 mt-1"
                        value={editingSupervisor.name}
                        onChange={(e) =>
                          setEditingSupervisor({
                            ...editingSupervisor,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-[#1A365D]">רשות</Label>
                      <Input
                        className="border-sky-200 focus:border-sky-500 mt-1"
                        value={editingSupervisor.authority}
                        onChange={(e) =>
                          setEditingSupervisor({
                            ...editingSupervisor,
                            authority: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-[#1A365D]">פרטי קשר</Label>
                      <Input
                        className="border-sky-200 focus:border-sky-500 mt-1"
                        value={editingSupervisor.contact_info}
                        onChange={(e) =>
                          setEditingSupervisor({
                            ...editingSupervisor,
                            contact_info: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="border-gray-300"
                        disabled={loadingStates.editing === supervisor.id}
                      >
                        ביטול
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-[#1A365D] hover:bg-[#2D4A6D]"
                        onClick={() => handleUpdateSupervisor(editingSupervisor)}
                        disabled={loadingStates.editing === supervisor.id}
                      >
                        {loadingStates.editing === supervisor.id ? (
                          <>
                            <span className="ml-2">מעדכן...</span>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          </>
                        ) : (
                          "שמור"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-[#1A365D]">{supervisor.name}</h4>
                      <p className="text-[#2D4A6D] text-sm">{supervisor.authority}</p>
                      <p className="text-[#2D4A6D] text-sm mt-1" dir="ltr">
                        {supervisor.contact_info}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditClick(supervisor)}
                        disabled={!!editingSupervisor || isAdding}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteSupervisor(supervisor.id)}
                        disabled={loadingStates.deleting === supervisor.id || !!editingSupervisor || isAdding}
                      >
                        {loadingStates.deleting === supervisor.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">{error}</div>}

      <div className="flex justify-start pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onClose(true)}
          className="border-gray-300"
          disabled={Object.values(loadingStates).some(Boolean) || !!editingSupervisor || isAdding}
        >
          סגור
        </Button>
      </div>
    </div>
  );
}
