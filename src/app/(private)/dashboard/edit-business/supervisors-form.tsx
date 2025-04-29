"use client";

import type React from "react";
import { useState } from "react";
import type { BusinessPreview, UserOwnedBusinessResponse } from "@/types";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import the API service
import { updateBusinessSupervisors } from "@/app/actions/dashboardAction";

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
  const [isAdding, setIsAdding] = useState(false);

  // Add loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveSupervisor = (id: string) => {
    setSupervisors(supervisors.filter((supervisor) => supervisor.id !== id));
  };

  const handleAddSupervisor = () => {
    if (newSupervisor.name && newSupervisor.authority && newSupervisor.contact_info) {
      const id = crypto.randomUUID();
      setSupervisors([...supervisors, { ...newSupervisor, id }]);
      setNewSupervisor({ name: "", authority: "", contact_info: "" });
      setIsAdding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      // Update supervisors
      const response = await updateBusinessSupervisors({
        businessId: business.business_id,
        supervisors: supervisors.map((supervisor) => ({
          id: supervisor.id,
          name: supervisor.name,
          authority: supervisor.authority,
          contact_info: supervisor.contact_info,
        })),
      });

      if (response.error) {
        throw new Error(response.message);
      }

      // Close the dialog on success with a message
      onClose(true, "פרטי המשגיחים עודכנו בהצלחה");
    } catch (err) {
      console.error("Failed to update supervisors:", err);
      setError(err instanceof Error ? err.message : "שגיאה בעדכון פרטי המשגיחים");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
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
                  onClick={() => setIsAdding(false)}
                  className="border-gray-300"
                >
                  ביטול
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#1A365D] hover:bg-[#2D4A6D]"
                  onClick={handleAddSupervisor}
                >
                  הוסף
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {supervisors.map((supervisor) => (
            <Card key={supervisor.id} className="border-sky-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-[#1A365D]">{supervisor.name}</h4>
                    <p className="text-[#2D4A6D] text-sm">{supervisor.authority}</p>
                    <p className="text-[#2D4A6D] text-sm mt-1" dir="ltr">
                      {supervisor.contact_info}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveSupervisor(supervisor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        {error && <div className="bg-red-50 text-red-600 p-2 rounded-md text-sm">{error}</div>}
        <div className="flex justify-start gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onClose()}
            className="border-gray-300"
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button type="submit" className="bg-[#1A365D] hover:bg-[#2D4A6D]" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="ml-2">שומר שינויים...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </>
            ) : (
              "שמור שינויים"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
