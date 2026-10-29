"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CueBadge } from "@/components/shared/badges/cue-badge";
import { TimelineShiftModal } from "@/components/modules/rundown/timeline-shift-modal";
import { RundownItem } from "@/components/modules/rundown/rundown-manager";
import {
  CheckSquare,
  Square,
  UserCheck,
  MapPin,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";

export interface RundownItemCardProps {
  item: RundownItem;
  weddingId: string;
  eventId: string;
  onToggleComplete: (id: string, currentCompleted: boolean) => void;
  onEdit: (item: RundownItem) => void;
  onDelete: (id: string, title: string) => void;
  isLast?: boolean;
}

export function RundownItemCard({
  item,
  weddingId,
  eventId,
  onToggleComplete,
  onEdit,
  onDelete,
  isLast = false,
}: RundownItemCardProps) {
  const cues = item.rundown_cues || [];

  return (
    <div className="relative flex items-start gap-2.5 sm:gap-4 group">
      {/* 1. HIGH-CONTRAST TIME PILL & CONNECTED AXIS */}
      <div className="flex flex-col items-center shrink-0 w-24 sm:w-32 pt-1">
        <div
          className={`px-2.5 sm:px-3 py-1 rounded-full font-mono font-bold text-[11px] sm:text-xs shadow-xs text-center border transition-all ${
            item.is_completed
              ? "bg-muted text-muted-foreground border-border/60"
              : "bg-foreground text-background border-transparent"
          }`}
        >
          {item.time_start} - {item.time_end}
        </div>

        {/* Connected Itinerary Timeline Line */}
        {!isLast && (
          <div className="w-0.5 bg-border/70 flex-1 my-2 min-h-[44px] transition-all group-hover:bg-primary/50" />
        )}
      </div>

      {/* 2. ELEVATED AIRBNB LUXE CONTENT CARD */}
      <Card
        className={`flex-1 rounded-2xl border transition-all duration-200 mb-3 shadow-xs hover:shadow-md ${
          item.is_completed
            ? "bg-muted/30 border-border/50 text-muted-foreground opacity-80"
            : "bg-card border-border/80 hover:border-primary/40 text-foreground"
        }`}
      >
        <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleComplete(item.id, item.is_completed)}
              className="h-8 w-8 shrink-0 rounded-full hover:bg-primary/10 mt-0.5"
              title={item.is_completed ? "Tandai Belum Selesai" : "Tandai Selesai"}
            >
              {item.is_completed ? (
                <CheckSquare className="h-5 w-5 text-emerald-500" />
              ) : (
                <Square className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              )}
            </Button>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`font-sans font-bold text-sm sm:text-base leading-snug tracking-tight ${
                    item.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {item.activity_title}
                </h3>

                {item.is_internal_only && (
                  <Badge variant="outline" className="text-[10px] uppercase border-amber-500/40 text-amber-600 rounded-full px-2 py-0">
                    Internal Only
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {item.pic_name && (
                  <span className="flex items-center gap-1 font-medium bg-muted/60 px-2 py-0.5 rounded-full text-[11px]">
                    <UserCheck className="h-3 w-3 text-primary" /> {item.pic_name}
                  </span>
                )}
                {item.location && (
                  <span className="flex items-center gap-1 font-medium bg-muted/60 px-2 py-0.5 rounded-full text-[11px]">
                    <MapPin className="h-3 w-3 text-emerald-600" /> {item.location}
                  </span>
                )}
              </div>

              {item.contingency_plan && (
                <div className="pt-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200/80 dark:border-rose-900/50">
                    <AlertCircle className="h-3 w-3" /> Plan B: {item.contingency_plan}
                  </span>
                </div>
              )}

              {cues.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {cues.map((c) => (
                    <CueBadge
                      key={c.id}
                      cueType={c.cue_type}
                      instruction={c.instruction}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 justify-end shrink-0 sm:self-center self-end pt-1 sm:pt-0">
            <TimelineShiftModal
              eventId={eventId}
              weddingId={weddingId}
              targetRundownId={item.id}
              targetActivityTitle={item.activity_title}
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground touch-manipulation"
              title="Edit Agenda & Cue Teknis"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item.id, item.activity_title)}
              className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10 touch-manipulation"
              title="Hapus Agenda"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
