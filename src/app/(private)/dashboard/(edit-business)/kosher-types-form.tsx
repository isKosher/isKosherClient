"use client";
import type React from "react";
import { useState } from "react";
import type { UserOwnedBusinessResponse } from "@/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { updateBusinessDetails } from "@/app/actions/dashboardAction";
import { useLookupData } from "@/contexts/lookup-context";
import SelectWithAdd from "@/components/select-with-add";

type KosherTypesFormProps = {
  business: UserOwnedBusinessResponse;
  onClose: (refreshData?: boolean, message?: string) => void;
};

export default function KosherTypesForm({ business, onClose }: KosherTypesFormProps) {
  const { lookupData, kosherTypes, addCustomKosherType, foodItemTypes, addCustomFoodItem } = useLookupData();

  const [selectedKosherTypes, setSelectedKosherTypes] = useState([...business.kosher_types]);
  const [selectedFoodTypes, setSelectedFoodTypes] = useState([...business.food_types]);
  const [selectedFoodItemTypes, setSelectedFoodItemTypes] = useState([...business.food_item_types]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get kosher type details with icon
  const getKosherTypeDetails = (typeName: string) => {
    return lookupData.kosher_types.find((kt) => kt.name === typeName);
  };

  // Helper function to get food type options
  const getFoodTypeOptions = () => {
    return lookupData.food_types.map((ft) => ({
      id: ft.id,
      name: ft.name,
      isCustom: false,
    }));
  };

  const handleRemoveKosherType = (typeName: string) => {
    setSelectedKosherTypes(selectedKosherTypes.filter((type) => type.name !== typeName));
  };

  const handleRemoveFoodType = (typeName: string) => {
    setSelectedFoodTypes(selectedFoodTypes.filter((type) => type !== typeName));
  };

  const handleRemoveFoodItemType = (typeName: string) => {
    setSelectedFoodItemTypes(selectedFoodItemTypes.filter((type) => type !== typeName));
  };

  const handleAddKosherType = (typeName: string) => {
    // Check if already selected
    if (selectedKosherTypes.some((kt) => kt.name === typeName)) {
      return;
    }

    // Check if it's from lookup data or custom
    const existingType = lookupData.kosher_types.find((kt) => kt.name === typeName);

    if (existingType) {
      // Add existing type
      setSelectedKosherTypes([
        ...selectedKosherTypes,
        {
          id: existingType.id,
          name: existingType.name,
          kosher_icon_url: existingType.kosher_icon_url,
        },
      ]);
    } else {
      // Add as custom type
      const customType = addCustomKosherType(typeName);
      setSelectedKosherTypes([
        ...selectedKosherTypes,
        {
          id: customType.id,
          name: customType.name,
          kosher_icon_url: null,
        },
      ]);
    }
  };

  const handleAddFoodType = (typeName: string) => {
    if (!selectedFoodTypes.includes(typeName)) {
      setSelectedFoodTypes([...selectedFoodTypes, typeName]);
    }
  };

  const handleAddFoodItemType = (typeName: string) => {
    if (!selectedFoodItemTypes.includes(typeName)) {
      setSelectedFoodItemTypes([...selectedFoodItemTypes, typeName]);

      // Add to context if it's custom
      if (!lookupData.food_item_types.some((fit) => fit.name === typeName)) {
        addCustomFoodItem(typeName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);

      await updateBusinessDetails({
        business_id: business.business_id,
        kosher_types: selectedKosherTypes.map((type) => type.name),
        food_types: selectedFoodTypes,
        food_item_types: selectedFoodItemTypes,
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
      {/* Kosher Types Section */}
      <Card className="border-sky-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#1A365D] text-lg flex items-center gap-2">
            סוגי כשרות
            <Badge variant="secondary" className="bg-sky-50 text-sky-700">
              {selectedKosherTypes.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Kosher Types */}
          {selectedKosherTypes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedKosherTypes.map((type, index) => {
                const details = getKosherTypeDetails(type.name);
                return (
                  <Card key={`${type.name}-${index}`} className="border-sky-200 bg-sky-50/30">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {details?.kosher_icon_url ? (
                          <img
                            src={details.kosher_icon_url}
                            alt={type.name}
                            className="w-8 h-8 object-contain rounded"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-sky-100 rounded flex items-center justify-center text-sky-600 text-xs font-medium">
                            {type.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-[#1A365D] font-medium">{type.name}</span>
                        {!details && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            חדש
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveKosherType(type.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Add Kosher Type */}
          <SelectWithAdd
            options={kosherTypes}
            value=""
            onChange={(value) => handleAddKosherType(value)}
            onAddCustom={(name) => handleAddKosherType(name)}
            placeholder="בחר או הוסף סוג כשרות"
            className="max-w-md"
            allowCustom={true}
            selectedItems={selectedKosherTypes.map((kt) => kt.name)}
          />
        </CardContent>
      </Card>

      <Separator className="bg-sky-100" />

      {/* Food Types Section */}
      <Card className="border-sky-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#1A365D] text-lg flex items-center gap-2">
            סוגי מזון
            <Badge variant="secondary" className="bg-sky-50 text-sky-700">
              {selectedFoodTypes.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Food Types */}
          {selectedFoodTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFoodTypes.map((type, index) => (
                <Badge
                  key={`${type}-${index}`}
                  variant="outline"
                  className="bg-sky-50 text-[#1A365D] border-sky-200 px-3 py-2 text-sm"
                >
                  {type}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFoodType(type)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add Food Type */}
          <SelectWithAdd
            options={getFoodTypeOptions()}
            value=""
            onChange={(value) => handleAddFoodType(value)}
            onAddCustom={(name) => handleAddFoodType(name)}
            placeholder="בחר או הוסף סוג מזון"
            className="max-w-md"
            allowCustom={false}
            selectedItems={selectedFoodTypes}
          />
        </CardContent>
      </Card>

      <Separator className="bg-sky-100" />

      {/* Food Item Types Section */}
      <Card className="border-sky-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-[#1A365D] text-lg flex items-center gap-2">
            פריטי מזון
            <Badge variant="secondary" className="bg-sky-50 text-sky-700">
              {selectedFoodItemTypes.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Food Item Types */}
          {selectedFoodItemTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFoodItemTypes.map((item, index) => (
                <Badge
                  key={`${item}-${index}`}
                  variant="outline"
                  className="bg-sky-50 text-[#1A365D] border-sky-200 px-3 py-2 text-sm"
                >
                  {item}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFoodItemType(item)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Add Food Item Type */}
          <SelectWithAdd
            options={foodItemTypes}
            value=""
            onChange={(value) => handleAddFoodItemType(value)}
            onAddCustom={(name) => handleAddFoodItemType(name)}
            placeholder="בחר או הוסף פריט מזון"
            className="max-w-md"
            allowCustom={true}
            selectedItems={selectedFoodItemTypes}
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <Card className="border-sky-100 shadow-sm">
        <CardContent className="pt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
              <X className="h-4 w-4 text-red-500" />
              {error}
            </div>
          )}

          <div className="flex justify-start gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              className="border-gray-300 hover:bg-gray-50"
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button type="submit" className="bg-[#1A365D] hover:bg-[#2D4A6D] text-white px-6" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>שומר שינויים...</span>
                </div>
              ) : (
                "שמור שינויים"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
