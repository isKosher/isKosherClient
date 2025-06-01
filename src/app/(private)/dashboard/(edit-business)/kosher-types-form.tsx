"use client";
import type React from "react";
import { useState } from "react";
import type { UserOwnedBusinessResponse } from "@/types";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateBusinessDetails } from "@/app/actions/dashboardAction";

type KosherTypesFormProps = {
  business: UserOwnedBusinessResponse;
  onClose: (refreshData?: boolean, message?: string) => void;
};

export default function KosherTypesForm({ business, onClose }: KosherTypesFormProps) {
  const [kosherTypes, setKosherTypes] = useState([...business.kosher_types]);
  const [foodTypes, setFoodTypes] = useState([...business.food_types]);
  const [foodItemTypes, setFoodItemTypes] = useState([...business.food_item_types]);
  const [newFoodType, setNewFoodType] = useState("");
  const [newFoodItemType, setNewFoodItemType] = useState("");
  const [newKosherType, setNewKosherType] = useState("");
  const [showAddKosher, setShowAddKosher] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRemoveKosherType = (id: string) => {
    setKosherTypes(kosherTypes.filter((type) => type.id !== id));
  };

  const handleRemoveFoodType = (index: number) => {
    setFoodTypes(foodTypes.filter((_, i) => i !== index));
  };

  const handleRemoveFoodItemType = (index: number) => {
    setFoodItemTypes(foodItemTypes.filter((_, i) => i !== index));
  };

  const handleAddFoodType = () => {
    if (newFoodType.trim()) {
      setFoodTypes([...foodTypes, newFoodType.trim()]);
      setNewFoodType("");
    }
  };

  const handleAddFoodItemType = () => {
    if (newFoodItemType.trim()) {
      setFoodItemTypes([...foodItemTypes, newFoodItemType.trim()]);
      setNewFoodItemType("");
    }
  };

  const handleAddKosherType = () => {
    if (newKosherType.trim()) {
      const newKosher = {
        id: `temp-${Date.now()}`,
        name: newKosherType.trim(),
        kosher_icon_url: null,
      };
      setKosherTypes([...kosherTypes, newKosher]);
      setNewKosherType("");
      setShowAddKosher(false);
    }
  };

  const handleCancelAddKosher = () => {
    setNewKosherType("");
    setShowAddKosher(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      await updateBusinessDetails({
        business_id: business.business_id,
        kosher_types: kosherTypes.map((type) => type.name),
        food_types: foodTypes,
        food_item_types: foodItemTypes,
      });

      onClose(true, "פרטי הכשרות עודכנו בהצלחה");
    } catch (err) {
      console.error("Failed to update kosher types:", err);
      setError(err instanceof Error ? err.message : "שגיאה בעדכון פרטי הכשרות");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div>
        <Label className="text-[#1A365D] text-lg mb-2 block">סוגי כשרות</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {kosherTypes.map((type) => (
            <Card key={type.id} className="border-sky-200">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center">
                  {type.kosher_icon_url && (
                    <img
                      src={type.kosher_icon_url || "/placeholder.svg"}
                      alt={type.name}
                      className="w-8 h-8 object-contain mr-2"
                    />
                  )}
                  <span className="text-[#1A365D]">{type.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-[#1A365D]"
                  onClick={() => handleRemoveKosherType(type.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* אזור הוספת כשרות חדשה */}
        {showAddKosher ? (
          <Card className="mt-3 border-sky-200 border-dashed">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="שם סוג כשרות"
                  className="border-sky-200 focus:border-sky-500"
                  value={newKosherType}
                  onChange={(e) => setNewKosherType(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKosherType();
                    }
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[#1A365D] border-sky-200"
                  onClick={handleAddKosherType}
                  disabled={!newKosherType.trim()}
                >
                  <Plus className="h-4 w-4 ml-1" /> הוסף
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={handleCancelAddKosher}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 text-[#1A365D] border-sky-200"
            onClick={() => setShowAddKosher(true)}
          >
            <Plus className="h-4 w-4 ml-1" /> הוסף סוג כשרות
          </Button>
        )}
      </div>

      <Separator />

      <div>
        <Label className="text-[#1A365D] text-lg mb-2 block">סוגי מזון</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {foodTypes.map((type, index) => (
            <Badge key={index} variant="outline" className="bg-sky-50 text-[#1A365D] border-sky-200 px-3 py-1.5">
              {type}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 ml-1 text-[#1A365D]"
                onClick={() => handleRemoveFoodType(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="הוסף סוג מזון"
            className="border-sky-200 focus:border-sky-500"
            value={newFoodType}
            onChange={(e) => setNewFoodType(e.target.value)}
          />
          <Button type="button" variant="outline" className="text-[#1A365D] border-sky-200" onClick={handleAddFoodType}>
            <Plus className="h-4 w-4 ml-1" /> הוסף
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-[#1A365D] text-lg mb-2 block">פריטי מזון</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {foodItemTypes.map((item, index) => (
            <Badge key={index} variant="outline" className="bg-sky-50 text-[#1A365D] border-sky-200 px-3 py-1.5">
              {item}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 ml-1 text-[#1A365D]"
                onClick={() => handleRemoveFoodItemType(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="הוסף פריט מזון"
            className="border-sky-200 focus:border-sky-500"
            value={newFoodItemType}
            onChange={(e) => setNewFoodItemType(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            className="text-[#1A365D] border-sky-200"
            onClick={handleAddFoodItemType}
          >
            <Plus className="h-4 w-4 ml-1" /> הוסף
          </Button>
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
