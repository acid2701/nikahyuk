"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { CueTypeEnum } from "@/types/database.types";
import { Volume2, Sun, Music, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CueBadgeProps {
  cueType: CueTypeEnum;
  instruction?: string;
  className?: string;
}

export function CueBadge({ cueType, instruction, className }: CueBadgeProps) {
  let icon = <Volume2 className="h-3 w-3" />;
  let colorClass = "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300";
  let label = "SOUND";

  if (cueType === "lighting") {
    icon = <Sun className="h-3 w-3" />;
    colorClass = "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300";
    label = "LIGHTING";
  } else if (cueType === "music") {
    icon = <Music className="h-3 w-3" />;
    colorClass = "bg-purple-500/15 text-purple-700 border-purple-500/30 dark:text-purple-300";
    label = "MUSIC";
  } else if (cueType === "multimedia") {
    icon = <Video className="h-3 w-3" />;
    colorClass = "bg-teal-500/15 text-teal-700 border-teal-500/30 dark:text-teal-300";
    label = "MULTIMEDIA";
  }

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 text-[10px] font-semibold uppercase px-2 py-0.5", colorClass, className)}
    >
      {icon}
      <span>{label}: {instruction}</span>
    </Badge>
  );
}
