"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Option } from "@/lib/schemaCreateBusiness";

interface DynamicComboboxProps {
  options: Option[];
  selected: Option[];
  onSelect: (option: Option) => void;
  onRemove: (option: Option) => void;
  onAdd?: (name: string) => void;
  placeholder: string;
  emptyText: string;
  addNewText: string;
  multiple?: boolean;
  allowCustom?: boolean; // New prop
}

export function DynamicCombobox({
  options,
  selected,
  onSelect,
  onRemove,
  onAdd,
  placeholder,
  emptyText,
  addNewText,
  multiple = false,
  allowCustom = true, // Default to true for backward compatibility
}: DynamicComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newItemName, setNewItemName] = React.useState("");
  const [search, setSearch] = React.useState("");

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    if (multiple) {
      if (selected.some((item) => item.id === option.id)) {
        onRemove(option);
      } else {
        onSelect(option);
      }
    } else {
      onSelect(option);
      setOpen(false);
    }
  };

  const handleAddNew = () => {
    if (newItemName.trim() && onAdd) {
      onAdd(newItemName.trim());
      setNewItemName("");
      setDialogOpen(false);
      setSearch("");
      setOpen(true);
    }
  };

  const showAddNew =
    allowCustom &&
    search &&
    !filteredOptions.some((option) => option.name.toLowerCase() === search.toLowerCase());

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-right"
          >
            <span className="truncate">
              {multiple ? `${selected.length} נבחרו` : selected[0]?.name || placeholder}
            </span>
            <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={search}
              onValueChange={setSearch}
              className="text-right"
            />
            <CommandList>
              <CommandEmpty>
                {showAddNew ? (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-right"
                      onClick={() => setDialogOpen(true)}
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      הוסף "{search}"
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>הוספת פריט חדש</DialogTitle>
                        <DialogDescription>האם אתה בטוח שברצונך להוסיף את הפריט החדש?</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>שם</Label>
                          <Input
                            value={newItemName || search}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="text-right"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddNew} disabled={!newItemName && !search}>
                          הוסף
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  emptyText
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => handleSelect(option)}
                    className="text-right"
                  >
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        selected.some((item) => item.id === option.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.name}
                    {option.isCustom && (
                      <Badge variant="secondary" className="mr-2">
                        מותאם אישית
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {allowCustom && addNewText && !showAddNew && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <CommandItem onSelect={() => setDialogOpen(true)} className="text-right">
                        <Plus className="ml-2 h-4 w-4" />
                        {addNewText}
                      </CommandItem>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>הוספת פריט חדש</DialogTitle>
                          <DialogDescription>הכנס את שם הפריט החדש שברצונך להוסיף</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>שם</Label>
                            <Input
                              value={newItemName}
                              onChange={(e) => setNewItemName(e.target.value)}
                              className="text-right"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddNew} disabled={!newItemName.trim()}>
                            הוסף
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {multiple && selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <Badge key={item.id} variant="secondary" className="flex items-center gap-1">
              {item.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onRemove(item)}
              >
                ×
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
