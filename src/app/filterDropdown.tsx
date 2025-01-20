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

//make generic filter dropdown component
interface FilterProps {
  filterOptions: string[];
  loading: boolean;
  filterPlaceholder: string;
}

export default function FilterDropdown(props: FilterProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only proceed if dropdownRef and the event target exist
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    // Add event listener for mousedown (better for detecting the click)
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener when the component unmounts
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
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };
  return (
    <DropdownMenu
      open={isDropdownOpen}
      onOpenChange={handleOpenChange}
      modal={false}
    >
      <DropdownMenuTrigger asChild className="hebrew-side">
        <Button
          variant="outline"
          className="w-full justify-between p-4 text-md lg:text-lg border-2 border-[#1A365D]/20 rounded-lg text-wrap h-full"
          disabled={props.loading}
        >
          {props.filterPlaceholder}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={dropdownRef}
        className="w-full flex flex-col justify-start"
      >
        <DropdownMenuCheckboxItem
          checked={selectedFilters.length === props.filterOptions.length}
          onCheckedChange={() =>
            setSelectedFilters(
              selectedFilters.length === props.filterOptions.length
                ? []
                : props.filterOptions
            )
          }
          className="w-full px-4 py-2 hebrew-side"
        >
          בחר הכל
        </DropdownMenuCheckboxItem>
        {props.filterOptions.map((filter) => (
          <DropdownMenuCheckboxItem
            key={filter}
            checked={selectedFilters.includes(filter)}
            onCheckedChange={() => toggleFilter(filter)}
            className="w-full px-4 py-2 text-base hebrew-side"
          >
            {filter}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
