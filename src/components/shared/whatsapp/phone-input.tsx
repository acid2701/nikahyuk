"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { sanitizePhoneNumber } from "@/lib/utils/wa-sanitizer";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  showPreview?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  showPreview = true,
  className,
  placeholder = "e.g. 081234567890",
  ...props
}: PhoneInputProps) {
  const sanitized = sanitizePhoneNumber(value);

  return (
    <div className="space-y-1">
      <div className="relative flex items-center">
        <Phone className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="tel"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("pl-9 font-mono text-sm", className)}
          {...props}
        />
      </div>
      {showPreview && value && (
        <p className="text-[11px] text-muted-foreground pl-1">
          Standar Internasional: <span className="font-mono font-semibold text-primary">+{sanitized}</span>
        </p>
      )}
    </div>
  );
}
