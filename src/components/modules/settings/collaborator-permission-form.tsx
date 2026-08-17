"use client";

import * as React from "react";
import { CustomPermissions } from "@/types/database.types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { updateCollaboratorPermissionsAction } from "@/actions/wedding-actions";

export interface CollaboratorPermissionFormProps {
  collaboratorId: string;
  weddingId: string;
  initialPermissions: CustomPermissions;
}

export function CollaboratorPermissionForm({
  collaboratorId,
  weddingId,
  initialPermissions,
}: CollaboratorPermissionFormProps) {
  const [permissions, setPermissions] =
    React.useState<CustomPermissions>(initialPermissions);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  async function handleSave() {
    setLoading(true);
    try {
      await updateCollaboratorPermissionsAction(
        collaboratorId,
        weddingId,
        permissions
      );
      toast({
        title: "Izin Kolaborator Diperbarui",
        description: "Matriks izin kustom berhasil disimpan.",
        variant: "success",
      });
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

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card/60">
      <h4 className="text-sm font-semibold text-foreground">
        Matriks Izin Kustom
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
