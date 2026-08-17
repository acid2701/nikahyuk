"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppDirectLink } from "@/lib/utils/wa-sanitizer";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WAButtonProps {
  phone: string;
  templateString?: string;
  variables?: Record<string, string>;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function WAButton({
  phone,
  templateString = "Halo, saya ingin mendiskusikan persiapan pernikahan.",
  variables = {},
  label = "WhatsApp Direct",
  variant = "outline",
  size = "sm",
  className,
}: WAButtonProps) {
  const link = buildWhatsAppDirectLink(phone, templateString, variables);

  if (!phone || !link) {
    return null;
  }

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn(
        "gap-2 text-xs font-semibold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700",
        className
      )}
    >
      <a href={link} target="_blank" rel="noopener noreferrer">
        <MessageSquare className="h-3.5 w-3.5" />
        <span>{label}</span>
      </a>
    </Button>
  );
}
