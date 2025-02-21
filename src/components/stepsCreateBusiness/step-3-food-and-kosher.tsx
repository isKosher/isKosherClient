"use client";

import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/from";
import { DynamicCombobox } from "@/components/ui/dynamic-combobox";
import {
  businessTypes as initialBusinessTypes,
  kosherTypes as initialKosherTypes,
  foodTypes as initialFoodTypes,
  foodItems as initialFoodItems,
  Option,
  FormData,
} from "@/lib/schemaCreateBusiness";
import { useState } from "react";

export function Step3FoodAndKosher() {
  const form = useFormContext<FormData>();
  const [businessTypes, setBusinessTypes] = useState<Option[]>(initialBusinessTypes);
  const [kosherTypes, setKosherTypes] = useState<Option[]>(initialKosherTypes);
  const [foodTypes, setFoodTypes] = useState<Option[]>(initialFoodTypes);
  const [foodItems, setFoodItems] = useState<Option[]>(initialFoodItems);

  if (!form) {
    return null;
  }

  const handleAddBusinessType = (name: string) => {
    const newType: Option = {
      id: `custom-${Date.now()}`,
      name,
      isCustom: true,
    };
    setBusinessTypes([...businessTypes, newType]);
    form.setValue("business_type", newType);
  };

  const handleAddKosherType = (name: string) => {
    const newType: Option = {
      id: `custom-${Date.now()}`,
      name,
      isCustom: true,
    };
    setKosherTypes([...kosherTypes, newType]);
    const currentTypes = form.getValues("kosher_types") || [];
    form.setValue("kosher_types", [...currentTypes, newType]);
  };

  const handleAddFoodType = (name: string) => {
    const newType: Option = {
      id: `custom-${Date.now()}`,
      name,
      isCustom: true,
    };
    setFoodTypes([...foodTypes, newType]);
    const currentTypes = form.getValues("food_types") || [];
    form.setValue("food_types", [...currentTypes, newType]);
  };

  const handleAddFoodItem = (name: string) => {
    const newItem: Option = {
      id: `custom-${Date.now()}`,
      name,
      isCustom: true,
    };
    setFoodItems([...foodItems, newItem]);
    const currentItems = form.getValues("food_items") || [];
    form.setValue("food_items", [...currentItems, newItem]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-sky-800">סוגי אוכל וכשרות</h2>

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
                onSelect={(option) => form.setValue("business_type", option)}
                onRemove={() => form.setValue("business_type", { name: "", id: "", isCustom: false })}
                onAdd={handleAddBusinessType}
                placeholder="בחר סוג עסק"
                emptyText="לא נמצאו תוצאות"
                addNewText="הוסף סוג עסק חדש"
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
                selected={field.value ? field.value.map((item) => ({ ...item, id: item.id || "" })) : []}
                onSelect={(option) => {
                  const current = field.value || [];
                  form.setValue("kosher_types", [...current, option]);
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
            <FormLabel>סוגי אוכל</FormLabel>
            <FormControl>
              <DynamicCombobox
                options={foodTypes}
                selected={field.value ? field.value.map((item) => ({ ...item, id: item.id || "" })) : []}
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
                onAdd={handleAddFoodType}
                placeholder="בחר סוגי אוכל"
                emptyText="לא נמצאו תוצאות"
                addNewText="הוסף סוג אוכל חדש"
                multiple
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
                options={foodItems}
                selected={field.value ? field.value.map((item) => ({ ...item, id: item.id || "" })) : []}
                onSelect={(option) => {
                  const current = field.value || [];
                  form.setValue("food_items", [...current, option]);
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
