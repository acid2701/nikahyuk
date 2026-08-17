"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CueBadge } from "@/components/shared/badges/cue-badge";
import { RundownItem } from "@/components/modules/rundown/rundown-manager";
import { Volume2, Music, Lightbulb, Video, Sliders } from "lucide-react";

export interface AudioCuesDrawerProps {
  rundowns: RundownItem[];
}

export function AudioCuesDrawer({ rundowns }: AudioCuesDrawerProps) {
  const [open, setOpen] = React.useState(false);

  // Group all cues across rundowns
  const allCuesList: {
    timeStart: string;
    timeEnd: string;
    activityTitle: string;
    cueType: string;
    instruction: string;
  }[] = [];

  rundowns.forEach((r) => {
    (r.rundown_cues || []).forEach((c) => {
      allCuesList.push({
        timeStart: r.time_start,
        timeEnd: r.time_end,
        activityTitle: r.activity_title,
        cueType: c.cue_type,
        instruction: c.instruction,
      });
    });
  });

  const soundCues = allCuesList.filter((c) => c.cueType === "sound");
  const musicCues = allCuesList.filter((c) => c.cueType === "music");
  const lightingCues = allCuesList.filter((c) => c.cueType === "lighting");
  const multimediaCues = allCuesList.filter((c) => c.cueType === "multimedia");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sliders className="h-4 w-4 text-primary" />
          Technical Cues Sheet ({allCuesList.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Lembar Cue Teknis (Sound, Lighting & Multimedia)
          </DialogTitle>
          <DialogDescription className="text-xs">
            Rangkuman instruksi panggung untuk Soundman, Lighting Crew, & Multimedia Operator.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {allCuesList.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-6">
              Belum ada cue teknis yang didaftarkan pada susunan acara rundown.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Sound Cues */}
              {soundCues.length > 0 && (
                <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Volume2 className="h-4 w-4 text-emerald-500" />
                    Sound & Microphone Cues ({soundCues.length}):
                  </h4>
                  <div className="space-y-1.5">
                    {soundCues.map((sc, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-card p-2 rounded border border-border/60">
                        <div className="space-y-0.5">
                          <span className="font-mono font-semibold text-primary text-[11px] mr-2">
                            {sc.timeStart} - {sc.timeEnd}
                          </span>
                          <span className="font-medium text-foreground">{sc.activityTitle}</span>
                        </div>
                        <CueBadge cueType="sound" instruction={sc.instruction} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Music Cues */}
              {musicCues.length > 0 && (
                <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Music className="h-4 w-4 text-blue-500" />
                    Music & Backsound Cues ({musicCues.length}):
                  </h4>
                  <div className="space-y-1.5">
                    {musicCues.map((mc, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-card p-2 rounded border border-border/60">
                        <div className="space-y-0.5">
                          <span className="font-mono font-semibold text-primary text-[11px] mr-2">
                            {mc.timeStart} - {mc.timeEnd}
                          </span>
                          <span className="font-medium text-foreground">{mc.activityTitle}</span>
                        </div>
                        <CueBadge cueType="music" instruction={mc.instruction} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lighting Cues */}
              {lightingCues.length > 0 && (
                <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Lighting & Spotlight Cues ({lightingCues.length}):
                  </h4>
                  <div className="space-y-1.5">
                    {lightingCues.map((lc, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-card p-2 rounded border border-border/60">
                        <div className="space-y-0.5">
                          <span className="font-mono font-semibold text-primary text-[11px] mr-2">
                            {lc.timeStart} - {lc.timeEnd}
                          </span>
                          <span className="font-medium text-foreground">{lc.activityTitle}</span>
                        </div>
                        <CueBadge cueType="lighting" instruction={lc.instruction} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multimedia Cues */}
              {multimediaCues.length > 0 && (
                <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-indigo-500" />
                    Multimedia & Screen Cues ({multimediaCues.length}):
                  </h4>
                  <div className="space-y-1.5">
                    {multimediaCues.map((mmc, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-card p-2 rounded border border-border/60">
                        <div className="space-y-0.5">
                          <span className="font-mono font-semibold text-primary text-[11px] mr-2">
                            {mmc.timeStart} - {mmc.timeEnd}
                          </span>
                          <span className="font-medium text-foreground">{mmc.activityTitle}</span>
                        </div>
                        <CueBadge cueType="multimedia" instruction={mmc.instruction} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
