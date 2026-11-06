"use client";

import React from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, Trash2, Pencil, Calendar, ExternalLink } from "lucide-react";
import { meldSpring } from "@/lib/motion-tokens";

interface SwipeableChecklistRowProps {
  id: string;
  itemName: string;
  isCompleted: boolean;
  completedBy?: string | null;
  completedAt?: string | null;
  dueDateBadge?: { text: string; className: string } | null;
  notes?: string | null;
  price?: number | null;
  actualPrice?: number | null;
  purchaseUrl?: string | null;
  assigneeName?: string | null;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SwipeableChecklistRow({
  itemName,
  isCompleted,
  completedBy,
  completedAt,
  dueDateBadge,
  notes,
  price,
  actualPrice,
  purchaseUrl,
  assigneeName,
  onToggleComplete,
  onEdit,
  onDelete,
}: SwipeableChecklistRowProps) {
  const x = useMotionValue(0);

  // Background reveal transforms
  const completeBgOpacity = useTransform(x, [0, 60], [0, 1]);
  const deleteBgOpacity = useTransform(x, [-60, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Swipe Right threshold >= 80px: Toggle Done
    if (info.offset.x > 80) {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(25);
        } catch {
          // ignore
        }
      }
      onToggleComplete();
    }
    // Swipe Left threshold <= -80px: Prompt Delete
    else if (info.offset.x < -80) {
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(35);
        } catch {
          // ignore
        }
      }
      onDelete();
    }
  };

  return (
    <div className="relative overflow-hidden select-none touch-pan-y">
      {/* BACKGROUND ACTIONS REVEAL */}
      {/* Swipe Right Background: Complete / Undo */}
      <motion.div
        style={{ opacity: completeBgOpacity }}
        className="absolute inset-y-0 left-0 w-24 bg-emerald-600 flex items-center justify-start pl-5 text-white pointer-events-none"
      >
        <Check className="h-5 w-5 stroke-[3]" />
      </motion.div>

      {/* Swipe Left Background: Delete */}
      <motion.div
        style={{ opacity: deleteBgOpacity }}
        className="absolute inset-y-0 right-0 w-24 bg-rose-600 flex items-center justify-end pr-5 text-white pointer-events-none"
      >
        <Trash2 className="h-5 w-5" />
      </motion.div>

      {/* FOREGROUND SWIPEABLE ROW */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        transition={meldSpring}
        className={`relative z-10 px-4 py-3.5 flex items-center justify-between gap-3 bg-card transition-colors ${
          isCompleted ? "bg-muted/20 text-muted-foreground" : "text-foreground"
        }`}
      >
        {/* LEFT: Check Circle + Text Content */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={onToggleComplete}
        >
          <div className="shrink-0">
            {isCompleted ? (
              <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border border-muted-foreground/40 hover:border-foreground transition-colors" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`text-xs sm:text-sm font-medium tracking-tight truncate ${
                  isCompleted
                    ? "line-through text-muted-foreground/70"
                    : "text-foreground"
                }`}
              >
                {itemName}
              </p>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Check className="h-3 w-3" />
                  {completedBy ? completedBy : "Selesai"}
                  {completedAt &&
                    ` • ${new Date(completedAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
              {dueDateBadge && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.2 rounded-full border border-transparent ${dueDateBadge.className}`}
                >
                  <Calendar className="h-3 w-3" />
                  {dueDateBadge.text}
                </span>
              )}
              {assigneeName && <span>• PIC: {assigneeName}</span>}
              {notes && <span className="line-clamp-1 truncate">• {notes}</span>}
            </div>
          </div>
        </div>

        {/* RIGHT: Numeric Price + Touch Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {price ? (
            <div className="text-right">
              {actualPrice ? (
                <div>
                  <span className="font-mono text-[10px] text-muted-foreground line-through block">
                    Rp {price.toLocaleString("id-ID")}
                  </span>
                  <span className="font-mono font-bold text-xs text-foreground block">
                    Rp {actualPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              ) : (
                <span className="font-mono font-semibold text-xs text-foreground block">
                  Rp {price.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          ) : null}

          <div className="flex items-center gap-0.5">
            {purchaseUrl && (
              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Link Belanja Online"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Hapus"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
