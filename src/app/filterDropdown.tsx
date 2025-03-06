"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Option } from "@/lib/schemaCreateBusiness";

interface FilterProps {
  filterOptions: Option[];
  loading: boolean;
  filterPlaceholder: string;
  onSelectFilters: (selectedFilters: string[]) => void;
  selectedFilters: string[];
}

export default function FilterDropdown(props: FilterProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    props.selectedFilters.filter((filter) => props.filterOptions.some((option) => option.name === filter))
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const validFilters = props.selectedFilters.filter((filter) =>
      props.filterOptions.some((option) => option.name === filter)
    );
    setSelectedFilters(validFilters);
  }, [props.selectedFilters, props.filterOptions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      return;
    }
    setIsDropdownOpen(open);
  };

  const toggleFilter = (filter: string) => {
    const updatedFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter((f) => f !== filter)
      : [...selectedFilters, filter];
    setSelectedFilters(updatedFilters);
    props.onSelectFilters(updatedFilters);
  };

  const handleSelectAll = () => {
    const allSelected = selectedFilters.length === props.filterOptions.length;
    const updatedFilters = allSelected ? [] : props.filterOptions.map((option) => option.name);
    setSelectedFilters(updatedFilters);
    props.onSelectFilters(updatedFilters);
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild className="hebrew-side">
        <Button
          variant="outline"
          className="w-full justify-between p-3 text-md border border-gray-300 rounded-lg text-wrap h-full"
          disabled={props.loading}
        >
          {selectedFilters.length > 0 ? `נבחרו ${selectedFilters.length} פריטים` : props.filterPlaceholder}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={dropdownRef}
        className="w-full flex flex-col justify-start"
        align="end"
        side="bottom"
        sideOffset={4}
        forceMount
      >
        <DropdownMenuCheckboxItem
          checked={selectedFilters.length === props.filterOptions.length}
          onCheckedChange={handleSelectAll}
          className="w-full px-4 py-2 hebrew-side"
        >
          בחר הכל
        </DropdownMenuCheckboxItem>
        {props.filterOptions.map((filter) => (
          <DropdownMenuCheckboxItem
            key={filter.id}
            checked={selectedFilters.includes(filter.name)}
            onCheckedChange={() => toggleFilter(filter.name)}
            className="w-full px-4 py-2 text-base hebrew-side"
          >
            {filter.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
