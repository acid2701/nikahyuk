"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DYNAMIC_ROLE_PRESETS, DynamicRolePreset } from "@/types/presets.types";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Shield } from "lucide-react";

export interface CustomRoleManagerModalProps {
  weddingId: string;
  onRolesChange?: (roles: DynamicRolePreset[]) => void;
  trigger?: React.ReactNode;
}

export function CustomRoleManagerModal({
  weddingId,
  onRolesChange,
  trigger,
}: CustomRoleManagerModalProps) {
  const storageKey = `nikahyuk_custom_roles_${weddingId}`;
  const [open, setOpen] = React.useState(false);
  const [roles, setRoles] = React.useState<DynamicRolePreset[]>(DYNAMIC_ROLE_PRESETS);
  const [newRoleName, setNewRoleName] = React.useState("");
  const [newRoleDesc, setNewRoleDesc] = React.useState("");
  const { toast } = useToast();

  const loadRoles = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRoles(parsed);
          onRolesChange?.(parsed);
          return;
        }
      } catch {
        // fallback to default
      }
    }
    setRoles(DYNAMIC_ROLE_PRESETS);
  }, [storageKey, onRolesChange]);

  React.useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  React.useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open, loadRoles]);

  function saveRoles(updatedRoles: DynamicRolePreset[]) {
    setRoles(updatedRoles);
    onRolesChange?.(updatedRoles);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(updatedRoles));
      window.dispatchEvent(new CustomEvent("nikahyuk_custom_roles_updated"));
    }
  }

  function handleAddRole(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newId = `role_${Date.now()}`;
    const newRoleObj: DynamicRolePreset = {
      id: newId,
      name: newRoleName.trim(),
      category: "custom",
      description: newRoleDesc.trim() || "Peran kustom tim acara.",
      defaultPermissions: {
        budget: false,
        vendor: false,
        rundown: true,
        guest: true,
        seating: true,
        checklist: false,
        gift_log: false,
        share: false,
      },

    };

    const updated = [...roles, newRoleObj];
    saveRoles(updated);

    toast({
      title: "Peran Kustom Ditambahkan!",
      description: `Peran '${newRoleName}' telah ditambahkan ke workspace ini.`,
      variant: "success",
    });

    setNewRoleName("");
    setNewRoleDesc("");
  }

  function handleDeleteRole(roleId: string, roleName: string) {
    const updated = roles.filter((r) => r.id !== roleId);
    saveRoles(updated);

    toast({
      title: "Peran Dihapus",
      description: `Peran kustom '${roleName}' telah dihapus.`,
      variant: "default",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Kelola Peran Kustom
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Kelola Peran Kolaborator Kustom
          </DialogTitle>
          <DialogDescription className="text-xs">
            Tambah atau hapus peran kustom dinamis untuk tim acara Anda (misal: Tim Fotografer, Desk Registrasi, MC, Seksi Konsumsi).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Add New Custom Role Form */}
          <form onSubmit={handleAddRole} className="p-3 border border-border rounded-lg bg-accent/20 space-y-3">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-primary" /> Tambah Peran Kustom Baru
            </span>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Nama Peran (e.g. Seksi Katering)"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="text-xs h-9"
                required
              />
              <Input
                placeholder="Deskripsi Tugas (Opsional)"
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <Button type="submit" size="sm" className="w-full h-8 text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Simpan Peran Baru
            </Button>
          </form>

          {/* Role List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <span className="text-xs font-semibold text-muted-foreground block">
              Daftar Peran Aktif ({roles.length}):
            </span>
            {roles.map((r) => {
              const isDefault = r.category === "default";
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2.5 rounded-md border border-border bg-card text-xs"
                >
                  <div className="space-y-0.5 max-w-[320px]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{r.name}</span>
                      <Badge
                        variant={isDefault ? "secondary" : "outline"}
                        className="text-[9px] px-1.5 py-0 uppercase"
                      >
                        {isDefault ? "Standar" : "Kustom"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {r.description}
                    </p>
                  </div>

                  {!isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => handleDeleteRole(r.id, r.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
