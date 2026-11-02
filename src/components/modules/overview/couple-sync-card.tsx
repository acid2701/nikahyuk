"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Heart,
  Users2,
  Plus,
  Trash2,
  Check,
  Send,
  User,
  Sparkles,
  Smile,
  ShieldCheck,
} from "lucide-react";
import {
  heartbeatCouplePresenceAction,
  createCoupleNoteAction,
  toggleCoupleNoteAction,
  deleteCoupleNoteAction,
  CouplePresenceItem,
} from "@/actions/couple-actions";
import { cn } from "@/lib/utils";

export interface CoupleNoteItem {
  id: string;
  authorRole: string;
  authorName: string;
  content: string;
  tag: string;
  isDone: boolean;
  createdAt: Date | string;
}

export interface CoupleSyncCardProps {
  weddingId: string;
  groomName: string;
  brideName: string;
  initialNotes: CoupleNoteItem[];
  currentUserEmail: string;
}

const NOTE_TAGS = [
  { label: "Catatan", color: "text-blue-600 bg-blue-500/10 border-blue-200" },
  { label: "Tugas Pria", color: "text-sky-600 bg-sky-500/10 border-sky-200" },
  { label: "Tugas Wanita", color: "text-rose-600 bg-rose-500/10 border-rose-200" },
  { label: "Impian Bersama", color: "text-amber-600 bg-amber-500/10 border-amber-200" },
] as const;

export function CoupleSyncCard({
  weddingId,
  groomName,
  brideName,
  initialNotes,
  currentUserEmail,
}: CoupleSyncCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [activeUsers, setActiveUsers] = React.useState<CouplePresenceItem[]>([]);
  const [notes, setNotes] = React.useState<CoupleNoteItem[]>(initialNotes);
  const [noteContent, setNoteContent] = React.useState("");
  const [selectedTag, setSelectedTag] = React.useState<string>("Catatan");
  const [authorRole, setAuthorRole] = React.useState<"groom" | "bride">("groom");
  const [submitting, setSubmitting] = React.useState(false);

  // Heartbeat presence pooling (every 15s)
  React.useEffect(() => {
    let isMounted = true;

    async function sendHeartbeat() {
      try {
        const res = await heartbeatCouplePresenceAction(weddingId, pathname);
        if (isMounted && res.success) {
          setActiveUsers(res.activeUsers);
        }
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
    }

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [weddingId, pathname]);

  // Sync initialNotes updates from server revalidation
  React.useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // Cari status partner online
  const isPartnerOnline = activeUsers.some((u) => u.isOnline && u.userName !== (authorRole === "groom" ? groomName : brideName));

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setSubmitting(true);
    const authorName = authorRole === "groom" ? groomName : brideName;

    try {
      const res = await createCoupleNoteAction({
        weddingId,
        authorRole,
        authorName,
        content: noteContent.trim(),
        tag: selectedTag,
      });

      if (res.success && res.note) {
        setNotes((prev) => [res.note, ...prev]);
        setNoteContent("");
        toast({
          title: "Catatan Tersimpan",
          description: "Catatan kasih berhasil ditambahkan ke workspace.",
          variant: "success",
        });
        router.refresh();
      }
    } catch (err) {
      toast({
        title: "Gagal Menyimpan",
        description: err instanceof Error ? err.message : "Terjadi kesalahan.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleNote(noteId: string, currentStatus: boolean) {
    const updatedStatus = !currentStatus;
    // Optimistic UI update
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, isDone: updatedStatus } : n))
    );

    try {
      await toggleCoupleNoteAction({
        weddingId,
        noteId,
        isDone: updatedStatus,
      });
      router.refresh();
    } catch (err) {
      // Rollback on error
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, isDone: currentStatus } : n))
      );
    }
  }

  async function handleDeleteNote(noteId: string) {
    const prevNotes = [...notes];
    setNotes((prev) => prev.filter((n) => n.id !== noteId));

    try {
      await deleteCoupleNoteAction({
        weddingId,
        noteId,
      });
      toast({
        title: "Catatan Dihapus",
        variant: "default",
      });
      router.refresh();
    } catch (err) {
      setNotes(prevNotes);
    }
  }

  return (
    <Card className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm transition-all hover:shadow-md">
      <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-200 text-rose-500 flex items-center justify-center shrink-0">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-sans text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                Kolaborasi Pasangan (Couple Sync)
                {isPartnerOnline && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Pasangan Sedang Online
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Ruang berbagi catatan, pembagian tugas romantis, dan sinkronisasi real-time antara {groomName} & {brideName}.
              </CardDescription>
            </div>
          </div>

          {/* Active Partner Presence Badges */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Groom Avatar */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-200 text-sky-700 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span>{groomName}</span>
            </div>
            {/* Heart Connector */}
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            {/* Bride Avatar */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-200 text-rose-700 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>{brideName}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Form Input Catatan Baru */}
        <form onSubmit={handleAddNote} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Sebagai:
              </span>
              <button
                type="button"
                onClick={() => setAuthorRole("groom")}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                  authorRole === "groom"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                🤵 {groomName}
              </button>
              <button
                type="button"
                onClick={() => setAuthorRole("bride")}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                  authorRole === "bride"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                👰 {brideName}
              </button>
            </div>

            {/* Pill Tag Selector */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {NOTE_TAGS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setSelectedTag(t.label)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shrink-0",
                    selectedTag === t.label
                      ? "border-primary bg-primary text-white shadow-xs"
                      : "border-border/70 bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Tulis pesan impian, tugas, atau catatan khusus untuk pasangan..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="h-10 text-xs sm:text-sm rounded-2xl bg-background border-border/80 focus-visible:ring-primary"
              disabled={submitting}
            />
            <Button
              type="submit"
              disabled={submitting || !noteContent.trim()}
              className="h-10 px-4 rounded-2xl bg-[#ff385c] hover:bg-[#e00b41] text-white shrink-0 shadow-xs"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Daftar Catatan Bersama */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Catatan Kasih & Impian ({notes.length})
            </span>
            <span className="text-[11px] text-muted-foreground">
              Tersinkronisasi otomatis antar akun
            </span>
          </div>

          {notes.length === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-border/80 text-center space-y-1.5 bg-muted/20">
              <Smile className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="text-xs font-medium text-foreground">
                Belum ada catatan bersama.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tuliskan pesan cinta, checklist khusus, atau impian pernikahan pertama Anda di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {notes.map((note) => {
                const isGroom = note.authorRole === "groom";
                const isDone = note.isDone;

                return (
                  <div
                    key={note.id}
                    className={cn(
                      "group p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-left relative",
                      isDone
                        ? "bg-muted/30 border-border/50 opacity-60"
                        : "bg-card border-border/80 hover:border-border hover:shadow-xs"
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                              isGroom
                                ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
                                : "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                            )}
                          >
                            {isGroom ? "🤵" : "👰"} {note.authorName}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground truncate">
                            • {note.tag}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-rose-600 rounded-md"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      <p
                        className={cn(
                          "text-xs leading-relaxed text-foreground",
                          isDone && "line-through text-muted-foreground"
                        )}
                      >
                        {note.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                      <span>
                        {new Date(note.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleNote(note.id, isDone)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] transition-all cursor-pointer",
                          isDone
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                        )}
                      >
                        <Check className="h-3 w-3" />
                        {isDone ? "Selesai" : "Tandai Selesai"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
