/**
 * DatePicker - Date input with calendar icon
 * Uses native input[type="date"] with custom styling
 */

"use client";

import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Seleccionar fecha",
  disabled,
}: DatePickerProps) {
  return (
    <div className="relative">
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn("pr-10", className)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
