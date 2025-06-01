"use client";
import { useRef, useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function BusinessesAdminSearch({
  value,
  onChange,
  placeholder = "חפש עסק...",
  className = "",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className={`relative flex items-center transition-all duration-200 ${className}`} ref={wrapperRef} dir="rtl">
      <button
        className={`search-anim-btn flex items-center justify-center rounded-full p-2 hover:bg-sky-100 active:bg-sky-200 transition
          border border-sky-200 shadow-sm
          ${open ? "bg-sky-50 border-sky-300" : ""}
        `}
        aria-label={open ? "סגור חיפוש" : "חיפוש"}
        onClick={() => setOpen(true)}
        type="button"
        tabIndex={0}
      >
        <Search className="w-5 h-5 text-[#1A365D]" />
      </button>
      <div
        className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300
          ${open ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-95"}
          z-50
        `}
        style={{
          left: "48px",
          width: open ? 180 : 0,
          minWidth: open ? 120 : 0,
        }}
        dir="rtl"
      >
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="rounded-full border-sky-200 bg-sky-50 px-4 pr-8 text-[#1A365D] h-9 shadow-md focus:border-sky-400"
            style={{
              width: open ? 180 : 0,
              minWidth: open ? 120 : 0,
              transition: "width 0.3s cubic-bezier(.4,1,.7,.98)",
            }}
            tabIndex={open ? 0 : -1}
          />
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 hover:bg-sky-100 rounded-full transition"
            tabIndex={open ? 0 : -1}
            style={{ display: value.length ? "block" : "none" }}
            aria-label="נקה חיפוש"
            type="button"
            onClick={() => onChange({ target: { value: "" } } as any)}
          >
            <X className="w-4 h-4 text-sky-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
