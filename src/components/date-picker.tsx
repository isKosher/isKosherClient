"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dir?: "rtl" | "ltr";
  showIcons?: boolean;
  variant?: "default" | "modern";
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "בחר תאריך",
  className,
  buttonClassName,
  dir = "rtl",
  showIcons = true,
  variant = "modern",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return format(date, "dd/MM/yyyy", { locale: he });
  };

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setIsOpen(false);
  };

  if (variant === "default") {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-right font-normal",
              !value && "text-muted-foreground",
              buttonClassName
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {value ? formatDate(value) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 z-50"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={handleSelect}
              disabled={disabled}
              initialFocus
              locale={he}
              dir={dir}
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full md:w-[280px] h-12 pr-4 pl-4 text-right font-medium relative overflow-hidden",
              "border-2 border-sky-100 hover:border-sky-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100",
              "bg-gradient-to-r from-white via-sky-50/20 to-white",
              "transition-all duration-300 ease-in-out",
              "hover:shadow-lg hover:shadow-sky-100/50",
              "group hover:scale-[1.02] transform",
              !value && "text-muted-foreground",
              buttonClassName
            )}
          >
            <div className="flex items-center justify-between w-full">
              {showIcons && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-sky-500 transition-transform duration-200 group-hover:scale-110" />
                  <Clock className="h-4 w-4 text-sky-400 opacity-60" />
                </div>
              )}
              <div className="text-right">
                {value ? (
                  <span className="text-[#1A365D] font-semibold">{formatDate(value)}</span>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </div>
            </div>
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-50/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 shadow-2xl border-0 bg-white/95 backdrop-blur-sm z-[9999]"
          align="end"
          sideOffset={8}
          side="bottom"
          avoidCollisions={true}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div
            className="bg-gradient-to-br from-white to-sky-50/30 rounded-lg border border-sky-100/50 overflow-hidden relative z-[9999]"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-3 text-white text-center font-semibold">
              בחירת תאריך
            </div>
            <div className="p-4" onMouseDown={(e) => e.stopPropagation()}>
              <Calendar
                mode="single"
                selected={value || undefined}
                onSelect={handleSelect}
                disabled={disabled}
                initialFocus
                locale={he}
                dir={dir}
                className="rtl"
                weekStartsOn={0}
                showOutsideDays={true}
                fixedWeeks
                classNames={{
                  day_selected:
                    "bg-gradient-to-br from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 focus:from-sky-600 focus:to-sky-700 shadow-lg transform scale-105",
                  day_today:
                    "bg-gradient-to-br from-sky-100 to-sky-200 text-sky-900 font-bold border-2 border-sky-300 !opacity-100",
                  day_outside: "text-gray-400 opacity-50",
                  day_disabled: "text-gray-300 opacity-30 cursor-not-allowed",
                  day_range_middle: "bg-sky-50",
                  nav_button:
                    "h-10 w-10 bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white border-0 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg shadow-md",
                  nav_button_previous: "absolute right-2",
                  nav_button_next: "absolute left-2",
                  day: "h-9 w-9 p-0 font-medium aria-selected:opacity-100 hover:bg-gradient-to-br hover:from-sky-100 hover:to-sky-200 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm relative overflow-hidden",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center mb-4",
                  caption_label: "text-lg font-bold text-[#1A365D]",
                  head_row: "flex",
                  head_cell: "text-sky-600 rounded-md w-9 font-semibold text-sm",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                }}
                components={{
                  Chevron: ({ orientation, ...props }) => {
                    if (orientation === "left") {
                      return <ArrowRight className="h-5 w-5 text-white" {...props} />;
                    }
                    if (orientation === "right") {
                      return <ArrowLeft className="h-5 w-5 text-white" {...props} />;
                    }
                    // Always return a React element
                    return <></>;
                  },
                }}
              />
            </div>
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-2 text-center text-xs text-sky-600 border-t border-sky-100">
              לחץ על התאריך הרצוי לבחירה
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
