import { z } from "zod";

export const RundownCueInputSchema = z.object({
  cueType: z.enum(["sound", "lighting", "multimedia", "music"] as const),
  instruction: z.string().min(1, "Instruksi cue teknis wajib diisi."),
});

export type RundownCueInput = z.infer<typeof RundownCueInputSchema>;

export const RundownItemInputSchema = z.object({
  weddingId: z.string().uuid(),
  eventId: z.string().uuid(),
  timeStart: z.string().min(1, "Waktu mulai wajib diisi."),
  timeEnd: z.string().min(1, "Waktu selesai wajib diisi."),
  activityTitle: z.string().min(1, "Judul agenda wajib diisi."),
  picName: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  contingencyPlan: z.string().optional().nullable(),
  isInternalOnly: z.boolean().optional(),
  cues: z.array(RundownCueInputSchema).optional(),
});

export type RundownItemInput = z.infer<typeof RundownItemInputSchema>;
