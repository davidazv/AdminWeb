/**
 * FormField - Reusable form field wrapper
 * Label arriba, input/control, helper/error abajo
 */

"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  helper,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {!error && helper && (
        <p className="text-sm text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}
