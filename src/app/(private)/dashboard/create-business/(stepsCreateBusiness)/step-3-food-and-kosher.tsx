"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DynamicCombobox } from "@/components/dynamic-combobox";
import { Loader2 } from "lucide-react";
import type { FormData } from "@/lib/schemaCreateBusiness";
import { useLookupData } from "@/contexts/lookup-context";
import { foodTypes } from "@/data/static-data";

export function Step3FoodAndKosher() {
  const form = useFormContext<FormData>();

  const {
    businessTypes,
    kosherTypes,
    foodItemTypes,
    isLoading,
    addCustomBusinessType,
    addCustomKosherType,
    addCustomFoodItem,
  } = useLookupData();

  if (!form) {
    return null;
  }

  const handleAddBusinessType = (name: string) => {
    const newType = addCustomBusinessType(name);
    form.setValue("business_type", {
      ...newType,
      isCustom: newType.isCustom ?? false,
    });
  };

  const handleAddKosherType = (name: string) => {
    const newType = addCustomKosherType(name);
    const currentTypes = form.getValues("kosher_types") || [];
    form.setValue("kosher_types", [...currentTypes, { ...newType, isCustom: newType.isCustom ?? false }]);
  };

  const handleAddFoodItem = (name: string) => {
    const newItem = addCustomFoodItem(name);
    const currentItems = form.getValues("food_items") || [];
    form.setValue("food_items", [...currentItems, { ...newItem, isCustom: newItem.isCustom ?? false }]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#1A365D]" />
        <p className="text-[#1A365D]">טוען נתונים...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#1A365D]">סוגי אוכל וכשרות</h2>

      <FormField
        control={form.control}
        name="business_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>סוג העסק</FormLabel>
            <FormControl>
              <DynamicCombobox
                options={businessTypes}
                selected={field.value ? [{ ...field.value, id: field.value.id || "" }] : []}
                onSelect={(option) => {
                  form.setValue("business_type", {
                    ...option,
                    isCustom: option.isCustom ?? false,
                  });
                }}
                onRemove={() =>
                  form.setValue("business_type", {
                    name: "",
                    id: "",
                    isCustom: false,
                  })
                }
                onAdd={handleAddBusinessType}
                placeholder="בחר סוג עסק"
                emptyText="לא נמצאו תוצאות"
                addNewText="הוסף סוג עסק חדש"
                multiple={false}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="kosher_types"
        render={({ field }) => (
          <FormItem>
            <FormLabel>סוגי כשרות</FormLabel>
            <FormControl>
              <DynamicCombobox
                options={kosherTypes}
                selected={(field.value || []).map((option) => ({
                  ...option,
                  id: option.id || "",
                }))}
                onSelect={(option) => {
                  const current = field.value || [];
                  form.setValue("kosher_types", [...current, { ...option, isCustom: option.isCustom ?? false }]);
                }}
                onRemove={(option) => {
                  const current = field.value || [];
                  form.setValue(
                    "kosher_types",
                    current.filter((item) => item.id !== option.id)
                  );
                }}
                onAdd={handleAddKosherType}
                placeholder="בחר סוגי כשרות"
                emptyText="לא נמצאו תוצאות"
                addNewText="הוסף סוג כשרות חדש"
                multiple
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="food_types"
        render={({ field }) => (
          <FormItem>
            <FormLabel>סוג אוכל</FormLabel>
            <FormControl>
              <DynamicCombobox
                options={[...foodTypes]}
                selected={(field.value || []).map((option) => ({
                  ...option,
                  id: option.id || "",
                }))}
                onSelect={(option) => {
                  const current = field.value || [];
                  form.setValue("food_types", [...current, option]);
                }}
                onRemove={(option) => {
                  const current = field.value || [];
                  form.setValue(
                    "food_types",
                    current.filter((item) => item.id !== option.id)
                  );
                }}
                placeholder="בחר סוג אוכל"
                emptyText="לא נמצאו תוצאות"
                addNewText=""
                multiple
                allowCustom={false}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="food_items"
        render={({ field }) => (
          <FormItem>
            <FormLabel>פריטי מזון</FormLabel>
            <FormControl>
              <DynamicCombobox
                options={foodItemTypes}
                selected={(field.value || []).map((option) => ({
                  ...option,
                  id: option.id || "",
                }))}
                onSelect={(option) => {
                  const current = field.value || [];
                  form.setValue("food_items", [...current, { ...option, isCustom: option.isCustom ?? false }]);
                }}
                onRemove={(option) => {
                  const current = field.value || [];
                  form.setValue(
                    "food_items",
                    current.filter((item) => item.id !== option.id)
                  );
                }}
                onAdd={handleAddFoodItem}
                placeholder="בחר פריטי מזון"
                emptyText="לא נמצאו תוצאות"
                addNewText="הוסף פריט מזון חדש"
                multiple
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
