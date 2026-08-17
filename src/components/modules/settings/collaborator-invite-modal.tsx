"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { inviteCollaboratorAction } from "@/actions/wedding-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, ShieldCheck } from "lucide-react";
import { UserRoleEnum, CustomPermissions } from "@/types/database.types";

export interface CollaboratorInviteModalProps {
  weddingId: string;
}

const DEFAULT_PERMISSIONS: Record<UserRoleEnum, CustomPermissions> = {
  wo: {
    budget: false,
    vendor: true,
    rundown: true,
    guest: true,
    gift_log: false,
  },
  family_committee: {
    budget: false,
    vendor: false,
    rundown: true,
    guest: true,
    gift_log: false,
  },
  partner: {
    budget: true,
    vendor: true,
    rundown: true,
    guest: true,
    gift_log: true,
  },
};

const PERMISSION_LABELS: { key: keyof CustomPermissions; label: string }[] = [
  { key: "budget", label: "Anggaran & Pembayaran" },
  { key: "vendor", label: "Vendor Hub & Kontrak" },
  { key: "rundown", label: "Live Rundown & Cues" },
  { key: "guest", label: "Master Tamu & RSVP" },
  { key: "gift_log", label: "Log Kado & Angpao" },
];

export function CollaboratorInviteModal({
  weddingId,
}: CollaboratorInviteModalProps) {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRoleEnum>("wo");
  const [permissions, setPermissions] = React.useState<CustomPermissions>(
    DEFAULT_PERMISSIONS.wo
  );
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  function handleRoleChange(newRole: UserRoleEnum) {
    setRole(newRole);
    setPermissions({ ...DEFAULT_PERMISSIONS[newRole] });
  }

  function togglePermission(key: keyof CustomPermissions) {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  async function handleInvite() {
    if (!email.trim()) {
      toast({
        title: "Perhatian",
        description: "Mohon masukkan email kolaborator.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await inviteCollaboratorAction(weddingId, email.trim(), role, permissions);

      toast({
        title: "Kolaborator Berhasil Ditambahkan",
        description: `${email} telah ditambahkan sebagai ${role === "wo" ? "Wedding Organizer" : role === "partner" ? "Partner" : "Panitia Keluarga"}.`,
        variant: "success",
      });

      setOpen(false);
      setEmail("");
      setRole("wo");
      setPermissions(DEFAULT_PERMISSIONS.wo);
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Menambahkan Kolaborator",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 h-9 text-xs font-semibold">
          <UserPlus className="h-4 w-4" />
          Undang Kolaborator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-serif text-lg">
                Undang Kolaborator Baru
              </DialogTitle>
              <DialogDescription className="text-xs">
                Tambahkan Wedding Organizer atau panitia keluarga dengan hak akses granular.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label
              htmlFor="invite-email"
              className="text-xs font-semibold text-foreground"
            >
              Email Kolaborator
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="kolaborator@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <p className="text-[10px] text-muted-foreground">
              Pastikan email terdaftar di NikahYuk agar kolaborator dapat mengakses workspace.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Peran (Role)
            </label>
            <Select
              value={role}
              onValueChange={(v) => handleRoleChange(v as UserRoleEnum)}
              disabled={loading}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="partner">Partner (Pasangan)</SelectItem>
                <SelectItem value="wo">Wedding Organizer (WO)</SelectItem>
                <SelectItem value="family_committee">Panitia Keluarga</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground">
              Hak Akses Modul (Granular Permissions)
            </label>
            <div className="rounded-lg border border-border divide-y divide-border">
              {PERMISSION_LABELS.map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-2.5"
                >
                  <span className="text-xs font-medium text-foreground">
                    {label}
                  </span>
                  <Switch
                    checked={permissions[key] || false}
                    onCheckedChange={() => togglePermission(key)}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleInvite}
            disabled={loading || !email.trim()}
            className="w-full h-10 text-xs font-semibold"
          >
            {loading ? "Menambahkan..." : "Tambahkan Kolaborator"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
