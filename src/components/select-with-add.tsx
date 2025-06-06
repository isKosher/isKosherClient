import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Plus, X, ChevronDown, Search, Check } from "lucide-react";
import { Option } from "@/types";

interface SelectWithAddProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  onAddCustom?: (name: string) => void;
  placeholder?: string;
  label?: string;
  allowCustom?: boolean;
  className?: string;
  selectedItems?: string[];
}

export default function SelectWithAdd({
  options = [],
  value,
  onChange,
  onAddCustom,
  placeholder = "בחר אפשרות",
  label,
  allowCustom = true,
  className = "",
  selectedItems = [],
}: SelectWithAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newOptionName, setNewOptionName] = useState("");
  const [error, setError] = useState("");

  const selectedOption = options.find((opt) => opt.name === value);

  const handleSelect = (option: Option) => {
    if (selectedItems.includes(option.name)) {
      return;
    }

    onChange(option.name);
    setIsOpen(false);
    setError("");
  };

  const handleAddCustom = () => {
    const trimmedName = newOptionName.trim();

    if (!trimmedName) {
      setError("יש להזין שם");
      return;
    }

    if (trimmedName.length < 2) {
      setError("השם חייב להכיל לפחות 2 תווים");
      return;
    }

    const alreadyExists = options.some((opt) => opt.name.toLowerCase() === trimmedName.toLowerCase());

    if (alreadyExists) {
      setError("האפשרות כבר קיימת");
      return;
    }

    if (onAddCustom) {
      onAddCustom(trimmedName);
      setNewOptionName("");
      setShowAddInput(false);
      setIsOpen(false);
      setError("");
    }
  };

  const handleCancelAdd = () => {
    setNewOptionName("");
    setShowAddInput(false);
    setError("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
    if (e.key === "Escape") {
      handleCancelAdd();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-[#1A365D] mb-2">{label}</label>}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between border-sky-200 hover:border-sky-300 focus:border-sky-500 bg-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={`${selectedOption ? "text-[#1A365D]" : "text-gray-500"}`}>
              {selectedOption ? selectedOption.name : placeholder}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 border border-sky-200 bg-white shadow-lg rounded-lg z-50"
          align="start"
          side="bottom"
          sideOffset={4}
          avoidCollisions={false}
          sticky="always"
        >
          <Command className="max-h-80">
            <div className="flex items-center border-b border-sky-100 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
              <CommandInput
                placeholder="חפש אפשרות..."
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <CommandList className="max-h-48 overflow-y-auto">
              <CommandEmpty className="py-6 text-center text-sm text-gray-500">לא נמצאו תוצאות</CommandEmpty>

              {options.map((option) => {
                const isSelected = selectedItems.includes(option.name);

                return (
                  <CommandItem
                    key={option.id}
                    onSelect={() => handleSelect(option)}
                    className={`flex items-center justify-between cursor-pointer px-3 py-2 relative ${
                      isSelected
                        ? "bg-sky-50 text-sky-700 opacity-60 cursor-not-allowed"
                        : "hover:bg-sky-50 text-[#1A365D]"
                    }`}
                    disabled={isSelected}
                  >
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="h-4 w-4 text-sky-600" />}
                      <span className={`font-medium ${isSelected ? "line-through" : ""}`}>{option.name}</span>
                      {isSelected && (
                        <span className="text-xs text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">נבחר</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {option.isCustom && !isSelected && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                          מותאם אישית
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>

          {allowCustom && (
            <div className="border-t border-sky-100 bg-sky-25">
              {showAddInput ? (
                <div className="p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newOptionName}
                      onChange={(e) => {
                        setNewOptionName(e.target.value);
                        setError("");
                      }}
                      placeholder="הזן אפשרות חדשה"
                      onKeyDown={handleKeyDown}
                      className="border-sky-200 focus:border-sky-500"
                      autoFocus
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustom}
                      disabled={!newOptionName.trim()}
                      className="bg-[#1A365D] hover:bg-[#2D4A6D] text-white px-4"
                      size="sm"
                    >
                      הוסף
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancelAdd}
                      size="sm"
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {error && (
                    <div className="text-red-500 text-xs bg-red-50 border border-red-200 rounded px-2 py-1">
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-center gap-2 text-[#1A365D] hover:bg-sky-50 hover:text-[#1A365D]"
                    onClick={() => setShowAddInput(true)}
                  >
                    <Plus className="h-4 w-4" />
                    הוסף אפשרות חדשה
                  </Button>
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
