"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { inviteCollaboratorAction } from "@/actions/wedding-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { UserPlus, ShieldCheck, Sparkles, Layers } from "lucide-react";
import { UserRoleEnum, CustomPermissions } from "@/types/database.types";
import { DYNAMIC_ROLE_PRESETS, DynamicRolePreset } from "@/types/presets.types";
import { CustomRoleManagerModal } from "./custom-role-manager-modal";

export interface SubEventItem {
  id: string;
  event_name: string;
}

export interface CollaboratorInviteModalProps {
  weddingId: string;
  customRoles?: DynamicRolePreset[];
  events?: SubEventItem[];
}

type ModulePermKey =
  | "budget"
  | "vendor"
  | "rundown"
  | "guest"
  | "seating"
  | "checklist"
  | "gift_log"
  | "share";

const PERMISSION_LABELS: { key: ModulePermKey; label: string; desc: string }[] = [
  { key: "budget", label: "Anggaran & Pembayaran", desc: "Pos biaya & termin pembayaran" },
  { key: "vendor", label: "Vendor Hub & Kontrak", desc: "Kontak vendor & file dokumen" },
  { key: "rundown", label: "Live Rundown & Cues", desc: "Susunan acara & aba-aba" },
  { key: "guest", label: "Master Tamu & RSVP", desc: "Daftar undangan & buku tamu" },
  { key: "seating", label: "Penataan Tempat Duduk", desc: "Denah meja & nomor kursi" },
  { key: "checklist", label: "Checklist Persiapan", desc: "Dokumen & berkas pra-nikah" },
  { key: "gift_log", label: "Log Kado & Angpao", desc: "Pencatatan amplop & kado" },
  { key: "share", label: "Berbagi Link (Share)", desc: "Akses token PWA panitia" },
];


export function CollaboratorInviteModal({
  weddingId,
  customRoles,
  events = [],
}: CollaboratorInviteModalProps) {
  const storageKey = `nikahyuk_custom_roles_${weddingId}`;
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [availableRoles, setAvailableRoles] = React.useState<DynamicRolePreset[]>(
    customRoles && customRoles.length > 0 ? customRoles : DYNAMIC_ROLE_PRESETS
  );
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("wo");
  const [permissions, setPermissions] = React.useState<CustomPermissions>({
    budget: false,
    vendor: true,
    rundown: true,
    guest: true,
    seating: true,
    checklist: true,
    gift_log: false,
    share: true,
  });

  const [allowedEvents, setAllowedEvents] = React.useState<string[]>(["all"]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const loadRolesFromStorage = React.useCallback(() => {
    if (customRoles && customRoles.length > 0) {
      setAvailableRoles(customRoles);
      return;
    }

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setAvailableRoles(parsed);
            return;
          }
        } catch {
          // fallback
        }
      }
    }
    setAvailableRoles(DYNAMIC_ROLE_PRESETS);
  }, [storageKey, customRoles]);

  React.useEffect(() => {
    loadRolesFromStorage();

    function handleUpdate() {
      loadRolesFromStorage();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("nikahyuk_custom_roles_updated", handleUpdate);
      return () => {
        window.removeEventListener("nikahyuk_custom_roles_updated", handleUpdate);
      };
    }
  }, [loadRolesFromStorage]);

  React.useEffect(() => {
    if (open) {
      loadRolesFromStorage();
    }
  }, [open, loadRolesFromStorage]);

  function handleRoleSelect(roleId: string) {
    setSelectedRoleId(roleId);
    const selected = availableRoles.find((r) => r.id === roleId);
    if (selected) {
      setPermissions({ ...selected.defaultPermissions });
    }
  }

  function togglePermission(key: keyof CustomPermissions) {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

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
    const selectedRole = availableRoles.find((r) => r.id === selectedRoleId);
    const dbRole: UserRoleEnum =
      selectedRoleId === "partner"
        ? "partner"
        : selectedRoleId === "family_committee"
        ? "family_committee"
        : "wo";

    const customPerms: CustomPermissions & { role_name?: string } = {
      ...permissions,
      allowed_event_ids: allowedEvents,
      role_name: selectedRole?.name || selectedRoleId,
    };

    try {
      await inviteCollaboratorAction(
        weddingId,
        email.trim(),
        dbRole,
        customPerms as any
      );

      toast({
        title: "Kolaborator Berhasil Ditambahkan",
        description: `${email} telah ditambahkan sebagai '${selectedRole?.name || selectedRoleId}'.`,
        variant: "success",
      });

      setOpen(false);
      setEmail("");
      setSelectedRoleId("wo");
      setAllowedEvents(["all"]);
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

  const isAllAllowed = allowedEvents.includes("all");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 h-9 text-xs font-semibold">
          <UserPlus className="h-4 w-4" />
          Undang Kolaborator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
                Tambahkan tim WO, panitia keluarga, atau peran kustom dengan izin granular & scope acara.
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Peran (Role) Dinamis
              </label>
              <CustomRoleManagerModal
                weddingId={weddingId}
                trigger={
                  <button
                    type="button"
                    className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    + Kelola / Tambah Peran Kustom
                  </button>
                }
              />
            </div>
            <Select
              value={selectedRoleId}
              onValueChange={handleRoleSelect}
              disabled={loading}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Pilih Peran" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {availableRoles.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="font-medium">{r.name}</span>
                      {r.category === "custom" && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                          KUSTOM
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground block truncate max-w-[280px]">
                      {r.description}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-Event Scope Restriction Box */}
          {events.length > 0 && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-600" />
                <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Scope Sub-Event Berizin (Anti-Bocor)
                </h4>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tentukan sub-event mana saja yang BOLEH diakses. Sub-event lain akan 100% terkunci dari kolaborator ini.
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
          )}

          {/* Granular Module Permissions (All 8 Modules) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-foreground">
              Hak Akses Modul (Granular Permissions - 8 Modul Utama)
            </label>
            <div className="rounded-lg border border-border divide-y divide-border max-h-56 overflow-y-auto">
              {PERMISSION_LABELS.map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <div>
                    <span className="text-xs font-medium text-foreground block">
                      {label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {desc}
                    </span>
                  </div>
                  <Switch
                    checked={Boolean(permissions[key])}
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
