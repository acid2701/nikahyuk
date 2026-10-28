"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  getStaffAdminPermissionsAction,
  updateStaffAdminPermissionsAction,
  StaffAdminPermissions,
} from "@/actions/admin-user-actions";
import { useToast } from "@/components/ui/use-toast";
import { UserCheck, ShieldCheck, Plus, Trash2, Loader2, KeyRound } from "lucide-react";

export default function StaffPermissionsPage() {
  const [staffList, setStaffList] = React.useState<StaffAdminPermissions[]>([]);
  const [newEmail, setNewEmail] = React.useState("");
  const [fetching, setFetching] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const { toast } = useToast();

  const loadPermissions = React.useCallback(async () => {
    try {
      const data = await getStaffAdminPermissionsAction();
      setStaffList(data);
    } catch (err) {
      toast({
        title: "Gagal Memuat Hak Akses Staf",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  function handleTogglePerm(email: string, permKey: keyof Omit<StaffAdminPermissions, "email">) {
    setStaffList((prev) =>
      prev.map((s) => (s.email === email ? { ...s, [permKey]: !s[permKey] } : s))
    );
  }

  function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      toast({
        title: "Email Tidak Valid",
        description: "Masukkan alamat email staf admin yang valid.",
        variant: "destructive",
      });
      return;
    }

    if (staffList.some((s) => s.email.toLowerCase() === newEmail.toLowerCase())) {
      toast({
        title: "Staf Sudah Ada",
        description: "Alamat email ini sudah terdaftar dalam daftar staf admin.",
        variant: "destructive",
      });
      return;
    }

    setStaffList([
      ...staffList,
      {
        email: newEmail.toLowerCase().trim(),
        canManageStorage: false,
        canViewAuditLogs: true,
        canManageBackups: false,
        canManageUsers: true,
        canEditRbacDefaults: false,
      },
    ]);

    setNewEmail("");
  }

  function handleRemoveStaff(email: string) {
    setStaffList((prev) => prev.filter((s) => s.email !== email));
  }

  async function handleSaveAll() {
    setSaving(true);
    try {
      await updateStaffAdminPermissionsAction(staffList);
      toast({
        title: "Hak Akses Staf Admin Disimpan",
        description: "Matriks izin kustom staf admin berhasil tersimpan di database.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Menyimpan Hak Akses",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 border border-dashed rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Memuat matriks hak akses staf admin...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-emerald-500" />
          Manajemen Hak Akses Staf Admin (RBAC Granular)
        </h1>
        <p className="text-sm text-muted-foreground">
          Atur matriks izin kustom untuk setiap staf admin yang ditunjuk agar dapat mengontrol fitur yang dapat diakses.
        </p>
      </div>

      <Card className="border-border/80 shadow-xs">
        <CardHeader className="bg-muted/30 pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Tambah Staf Admin Baru
          </CardTitle>
          <CardDescription className="text-xs">
            Daftarkan email pengguna yang telah dipromosikan sebagai Admin Staff.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleAddStaff} className="flex gap-3">
            <Input
              type="email"
              placeholder="e.g. staf.admin@nikahyu.my.id"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="max-w-md text-xs"
            />
            <Button type="submit" size="sm" className="gap-1 font-semibold">
              <Plus className="h-4 w-4" />
              Tambah ke Matriks Izin
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {staffList.map((staff) => (
          <Card key={staff.email} className="border-border/80 shadow-xs">
            <CardHeader className="bg-muted/20 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{staff.email}</CardTitle>
                    <CardDescription className="text-xs">
                      Staf Admin Platform
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                    ADMIN STAFF PERMISSIONS
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveStaff(staff.email)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    title="Hapus Staf"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60">
                  <div>
                    <p className="text-xs font-semibold">Akses Manajemen User Pendaftar</p>
                    <p className="text-[10px] text-muted-foreground">Melihat daftar user & ubah status</p>
                  </div>
                  <Switch
                    checked={staff.canManageUsers}
                    onCheckedChange={() => handleTogglePerm(staff.email, "canManageUsers")}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60">
                  <div>
                    <p className="text-xs font-semibold">Akses Cross-Tenant Audit Logs</p>
                    <p className="text-[10px] text-muted-foreground">Melihat log aktivitas platform</p>
                  </div>
                  <Switch
                    checked={staff.canViewAuditLogs}
                    onCheckedChange={() => handleTogglePerm(staff.email, "canViewAuditLogs")}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60">
                  <div>
                    <p className="text-xs font-semibold">Akses Konfigurasi Cloudflare R2</p>
                    <p className="text-[10px] text-muted-foreground">Mengubah kredensial & aturan storage</p>
                  </div>
                  <Switch
                    checked={staff.canManageStorage}
                    onCheckedChange={() => handleTogglePerm(staff.email, "canManageStorage")}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60">
                  <div>
                    <p className="text-xs font-semibold">Akses Encrypted SQL Backups</p>
                    <p className="text-[10px] text-muted-foreground">Mengunduh cadangan database</p>
                  </div>
                  <Switch
                    checked={staff.canManageBackups}
                    onCheckedChange={() => handleTogglePerm(staff.email, "canManageBackups")}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60 md:col-span-2">
                  <div>
                    <p className="text-xs font-semibold">Akses Template Role Defaults</p>
                    <p className="text-[10px] text-muted-foreground">Mengubah preset izin default global</p>
                  </div>
                  <Switch
                    checked={staff.canEditRbacDefaults}
                    onCheckedChange={() => handleTogglePerm(staff.email, "canEditRbacDefaults")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleSaveAll} className="w-full font-bold" disabled={saving}>
        {saving ? "Menyimpan ke Database..." : "Simpan Semua Matriks Hak Akses Staf Admin"}
      </Button>
    </div>
  );
}
