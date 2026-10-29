"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomPermissions } from "@/types/database.types";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { updateCollaboratorPermissionsAction } from "@/actions/wedding-actions";
import { Layers, ShieldAlert } from "lucide-react";

export interface SubEventItem {
  id: string;
  event_name: string;
}

export interface CollaboratorPermissionFormProps {
  collaboratorId: string;
  weddingId: string;
  initialPermissions: CustomPermissions & { allowed_event_ids?: string[] };
  events?: SubEventItem[];
}

export function CollaboratorPermissionForm({
  collaboratorId,
  weddingId,
  initialPermissions,
  events = [],
}: CollaboratorPermissionFormProps) {
  const router = useRouter();
  const [permissions, setPermissions] = React.useState<
    CustomPermissions & { allowed_event_ids?: string[] }
  >(initialPermissions);

  const [allowedEvents, setAllowedEvents] = React.useState<string[]>(
    Array.isArray(initialPermissions?.allowed_event_ids)
      ? initialPermissions.allowed_event_ids
      : ["all"]
  );

  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  function toggleEventAccess(eventId: string) {
    if (eventId === "all") {
      setAllowedEvents(["all"]);
      return;
    }

    let next = allowedEvents.filter((id) => id !== "all");
    if (next.includes(eventId)) {
      next = next.filter((id) => id !== eventId);
    } else {
      next.push(eventId);
    }

    if (next.length === 0) {
      next = ["all"];
    }

    setAllowedEvents(next);
  }

  async function handleSave() {
    setLoading(true);
    try {
      const updatedPerms = {
        ...permissions,
        allowed_event_ids: allowedEvents,
      };

      await updateCollaboratorPermissionsAction(
        collaboratorId,
        weddingId,
        updatedPerms as any
      );

      toast({
        title: "Izin Kolaborator Diperbarui",
        description: "Matriks izin kustom & batas akses sub-event berhasil disimpan.",
        variant: "success",
      });
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Memperbarui Izin",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const isAllAllowed = allowedEvents.includes("all");

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card/60">
      {/* Event Scope Restriction Section */}
      <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-600" />
          <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Akses Sub-Event Berizin (Anti-Bocor)
          </h4>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Pilih sub-event mana saja yang BOLEH diakses oleh kolaborator ini. Sub-event lain akan 100% terkunci.
        </p>

        <div className="pt-1 flex flex-wrap gap-3">
          <label className="flex items-center space-x-2 text-xs cursor-pointer font-medium">
            <Checkbox
              checked={isAllAllowed}
              onCheckedChange={() => toggleEventAccess("all")}
            />
            <span>Semua Acara (Akses Penuh)</span>
          </label>

          {events.map((evt) => {
            const isChecked = !isAllAllowed && allowedEvents.includes(evt.id);
            return (
              <label
                key={evt.id}
                className="flex items-center space-x-2 text-xs cursor-pointer"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleEventAccess(evt.id)}
                  disabled={isAllAllowed}
                />
                <span className={isAllAllowed ? "text-muted-foreground" : "font-medium"}>
                  {evt.event_name}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <h4 className="text-xs font-semibold text-foreground pt-1">
        Matriks Izin Kustom Modul
      </h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">Modul Anggaran (Budget)</p>
            <p className="text-[10px] text-muted-foreground">Pos biaya & termin pembayaran</p>
          </div>
          <Switch
            checked={permissions.budget}
            onCheckedChange={(val) =>
              setPermissions({ ...permissions, budget: val })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">Modul Vendor Hub</p>
            <p className="text-[10px] text-muted-foreground">Kontak vendor & file dokumen</p>
          </div>
          <Switch
            checked={permissions.vendor}
            onCheckedChange={(val) =>
              setPermissions({ ...permissions, vendor: val })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">Modul Live Rundown</p>
            <p className="text-[10px] text-muted-foreground">Susunan acara & aba-aba</p>
          </div>
          <Switch
            checked={permissions.rundown}
            onCheckedChange={(val) =>
              setPermissions({ ...permissions, rundown: val })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">Modul Tamu & Meja</p>
            <p className="text-[10px] text-muted-foreground">Daftar undangan & check-in</p>
          </div>
          <Switch
            checked={permissions.guest}
            onCheckedChange={(val) =>
              setPermissions({ ...permissions, guest: val })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">Log Kado & Angpao</p>
            <p className="text-[10px] text-muted-foreground">Pencatatan amplop & kado</p>
          </div>
          <Switch
            checked={permissions.gift_log}
            onCheckedChange={(val) =>
              setPermissions({ ...permissions, gift_log: val })
            }
          />
        </div>
      </div>

      <Button onClick={handleSave} size="sm" className="w-full" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan Perubahan Izin"}
      </Button>
    </div>
  );
}
