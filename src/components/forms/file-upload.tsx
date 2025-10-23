/**
 * FileUpload - File input with "Elegir archivo" button
 * Shows selected filename
 */

"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value?: File | null;
  onChange?: (file: File | null) => void;
  accept?: string;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  value,
  onChange,
  accept,
  className,
  disabled,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(value || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    onChange?.(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="w-full sm:w-auto"
      >
        <Upload className="mr-2 h-4 w-4" />
        Elegir archivo
      </Button>
      {selectedFile && (
        <p className="text-sm text-muted-foreground">
          Archivo seleccionado: <span className="font-medium">{selectedFile.name}</span>
        </p>
      )}
    </div>
  );
}
