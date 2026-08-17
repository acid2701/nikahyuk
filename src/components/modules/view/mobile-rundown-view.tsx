"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CueBadge } from "@/components/shared/badges/cue-badge";
import { useRealtimeRundown } from "@/hooks/use-realtime-rundown";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Clock, CheckSquare, Square, MapPin, UserCheck } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export interface MobileRundownItem {
  id: string;
  timeStart: string;
  timeEnd: string;
  activityTitle: string;
  picName?: string | null;
  location?: string | null;
  isCompleted: boolean;
  cues?: { id: string; cue_type: any; instruction: string }[];
}

export interface MobileRundownViewProps {
  token: string;
  eventId: string;
  initialRundowns: MobileRundownItem[];
}

export function MobileRundownView({ token, eventId, initialRundowns }: MobileRundownViewProps) {
  const [rundowns, setRundowns] = React.useState<MobileRundownItem[]>(initialRundowns);
  const realtimeUpdate = useRealtimeRundown(eventId);
  const { toast } = useToast();

  React.useEffect(() => {
    if (realtimeUpdate) {
      fetchLatestData();
    }
  }, [realtimeUpdate]);

  async function fetchLatestData() {
    const supabase = createClient();
    const { data } = await supabase
      .from("rundowns")
      .select("*, rundown_cues(*)")
      .eq("event_id", eventId)
      .order("sort_order", { ascending: true });

    if (data) {
      const mapped = data.map((d: any) => ({
        id: d.id,
        timeStart: d.time_start,
        timeEnd: d.time_end,
        activityTitle: d.activity_title,
        picName: d.pic_name,
        location: d.location,
        isCompleted: d.is_completed,
        cues: d.rundown_cues || [],
      }));
      setRundowns(mapped);
    }
  }

  async function handleToggle(rId: string, currentStatus: boolean) {
    try {
      const supabase = createClient();
      await supabase
        .from("rundowns")
        .update({ is_completed: !currentStatus })
        .eq("id", rId);

      toast({
        title: "Status Agenda Diperbarui",
        description: `Agenda ditandai ${!currentStatus ? "SELESAI" : "PENDING"}.`,
        variant: "success",
      });

      fetchLatestData();
    } catch (err) {
      toast({
        title: "Gagal Mengubah Agenda",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href={`/view/${token}`}>
          <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs px-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
        <span className="font-mono text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Clock className="h-3 w-3" /> Live Rundown
        </span>
      </div>

      <div className="space-y-2">
        {rundowns.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-8">
            Belum ada agenda susunan acara.
          </p>
        ) : (
          rundowns.map((r) => (
            <Card
              key={r.id}
              className={`border-border/70 transition-all ${
                r.isCompleted ? "bg-muted/30 border-muted" : "bg-card"
              }`}
            >
              <CardContent className="p-3 flex items-start space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggle(r.id, r.isCompleted)}
                  className="h-7 w-7 shrink-0 text-primary mt-0.5"
                >
                  {r.isCompleted ? (
                    <CheckSquare className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-primary">
                      {r.timeStart} - {r.timeEnd}
                    </span>
                  </div>

                  <h3
                    className={`font-semibold text-xs ${
                      r.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {r.activityTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    {r.picName && (
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" /> {r.picName}
                      </span>
                    )}
                    {r.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {r.location}
                      </span>
                    )}
                  </div>

                  {r.cues && r.cues.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {r.cues.map((c) => (
                        <CueBadge key={c.id} cueType={c.cue_type} instruction={c.instruction} />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
