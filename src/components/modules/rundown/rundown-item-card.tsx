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
}

export function RundownItemCard({
  item,
  weddingId,
  eventId,
  onToggleComplete,
  onEdit,
  onDelete,
}: RundownItemCardProps) {
  const cues = item.rundown_cues || [];

  return (
    <Card
      className={`border-border/80 transition-all ${
        item.is_completed ? "bg-muted/30 border-muted" : "bg-card"
      }`}
    >
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleComplete(item.id, item.is_completed)}
            className="h-7 w-7 shrink-0 text-primary mt-0.5"
            title={item.is_completed ? "Tandai Belum Selesai" : "Tandai Selesai"}
          >
            {item.is_completed ? (
              <CheckSquare className="h-5 w-5 text-emerald-500" />
            ) : (
              <Square className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-sm text-primary">
                {item.time_start} - {item.time_end}
              </span>
              <h3
                className={`font-semibold text-sm ${
                  item.is_completed ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {item.activity_title}
              </h3>

              {item.is_internal_only && (
                <Badge variant="outline" className="text-[10px] uppercase border-amber-500/40 text-amber-600">
                  Internal Only
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {item.pic_name && (
                <span className="flex items-center gap-1">
                  <UserCheck className="h-3 w-3" /> PIC: {item.pic_name}
                </span>
              )}
              {item.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {item.location}
                </span>
              )}
            </div>

            {item.contingency_plan && (
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200/80 dark:border-rose-900/50">
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

        <div className="flex items-center space-x-1 justify-end shrink-0">
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
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Edit Agenda & Cue Teknis"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id, item.activity_title)}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            title="Hapus Agenda"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
