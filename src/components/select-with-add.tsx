import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Plus, X, ChevronDown } from "lucide-react";
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
}: SelectWithAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newOptionName, setNewOptionName] = useState("");
  const [error, setError] = useState("");

  const selectedOption = options.find((opt) => opt.name === value);

  const handleSelect = (option: Option) => {
    onChange(option.name);
    setIsOpen(false);
  };

  const handleAddCustom = () => {
    const trimmedName = newOptionName.trim();

    if (!trimmedName) {
      setError("יש להזין שם");
      return;
    }

    const alreadyExists = options.some((opt) => opt.name.toLowerCase() === trimmedName.toLowerCase());

    if (alreadyExists) {
      setError("האפשרות כבר קיימת");
      return;
    }

    if (onAddCustom) {
      onAddCustom(trimmedName);
      onChange(trimmedName);
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

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-[#1A365D] mb-1">{label}</label>}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between" onClick={() => setIsOpen(!isOpen)}>
            <span>{selectedOption ? selectedOption.name : placeholder}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="חפש אפשרות..." />
            <CommandList>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  onSelect={() => handleSelect(option)}
                  className="flex items-center justify-between"
                >
                  <span>{option.name}</span>
                  {option.isCustom && (
                    <span className="text-xs text-sky-600 bg-sky-100 px-2 py-0.5 rounded">מותאם אישית</span>
                  )}
                </CommandItem>
              ))}
            </CommandList>
          </Command>

          {allowCustom && (
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              {showAddInput ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    placeholder="הזן אפשרות חדשה"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustom();
                      }
                      if (e.key === "Escape") {
                        handleCancelAdd();
                      }
                    }}
                    autoFocus
                  />
                  <Button type="button" onClick={handleAddCustom} disabled={!newOptionName.trim()}>
                    הוסף
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleCancelAdd}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" className="w-full justify-center gap-2" onClick={() => setShowAddInput(true)}>
                  <Plus className="h-4 w-4" />
                  הוסף אפשרות חדשה
                </Button>
              )}
              {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
