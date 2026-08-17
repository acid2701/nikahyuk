"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheck, Loader2 } from "lucide-react";

interface RolePermission {
  budget: boolean;
  vendor: boolean;
  rundown: boolean;
  guest: boolean;
  gift_log: boolean;
}

export default function RbacTemplatesPage() {
  const [woPerms, setWoPerms] = React.useState<RolePermission>({
    budget: false,
    vendor: true,
    rundown: true,
    guest: true,
    gift_log: false,
  });

  const [familyPerms, setFamilyPerms] = React.useState<RolePermission>({
    budget: false,
    vendor: false,
    rundown: true,
    guest: true,
    gift_log: false,
  });

  const [fetching, setFetching] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const json = await res.json();
          const rows = json.data || [];
          const rbacRow = rows.find((r: any) => r.key === "rbac_templates");

          if (rbacRow && rbacRow.value) {
            const val = rbacRow.value;
            if (val.wo) setWoPerms(val.wo);
            if (val.family) setFamilyPerms(val.family);
          }
        }
      } catch (err) {
        console.error("Gagal memuat template RBAC:", err);
      } finally {
        setFetching(false);
      }
    }
    loadConfig();
  }, []);

  async function handleSaveTemplates() {
    setLoading(true);
    try {
      const payload = {
        wo: woPerms,
        family: familyPerms,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "rbac_templates",
          value: payload,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Gagal menyimpan ke database");
      }

      toast({
        title: "Template RBAC Disimpan",
        description: "Standar hak akses default global berhasil tersimpan permanen di database.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Menyimpan",
        description: err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui template.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 border border-dashed rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Memuat template hak akses dari database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-serif flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
          Master Template Hak Akses (RBAC Defaults)
        </h2>
        <p className="text-sm text-muted-foreground">
          Atur matriks izin bawaan global untuk Wedding Organizer (WO) dan Panitia Keluarga.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-base font-semibold">
              Default Izin: Wedding Organizer (WO)
            </CardTitle>
            <CardDescription className="text-xs">
              Izin bawaan saat pasangan mengundang tim WO.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Modul Anggaran (Budget)</p>
                <p className="text-xs text-muted-foreground">Melihat & mengedit pos bujet</p>
              </div>
              <Switch
                checked={woPerms.budget}
                onCheckedChange={(val) => setWoPerms({ ...woPerms, budget: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Modul Vendor Hub</p>
                <p className="text-xs text-muted-foreground">Melihat kontak & file vendor</p>
              </div>
              <Switch
                checked={woPerms.vendor}
                onCheckedChange={(val) => setWoPerms({ ...woPerms, vendor: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Modul Live Rundown</p>
                <p className="text-xs text-muted-foreground">Mengatur susunan acara & shift timeline</p>
              </div>
              <Switch
                checked={woPerms.rundown}
                onCheckedChange={(val) => setWoPerms({ ...woPerms, rundown: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Modul Daftar Tamu & Meja</p>
                <p className="text-xs text-muted-foreground">Mengatur seating chart & check-in</p>
              </div>
              <Switch
                checked={woPerms.guest}
                onCheckedChange={(val) => setWoPerms({ ...woPerms, guest: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Log Kado & Angpao</p>
                <p className="text-xs text-muted-foreground">Catatan kado fisik & amplop</p>
              </div>
              <Switch
                checked={woPerms.gift_log}
                onCheckedChange={(val) => setWoPerms({ ...woPerms, gift_log: val })}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button onClick={handleSaveTemplates} className="w-full font-semibold" disabled={loading}>
              {loading ? "Menyimpan ke Database..." : "Simpan Template WO"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-base font-semibold">
              Default Izin: Panitia Keluarga
            </CardTitle>
            <CardDescription className="text-xs">
              Izin bawaan untuk keluarga dan penerima tamu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Modul Anggaran (Budget)</p>
                <p className="text-xs text-muted-foreground">Melihat & mengedit pos bujet</p>
              </div>
              <Switch
                checked={familyPerms.budget}
                onCheckedChange={(val) => setFamilyPerms({ ...familyPerms, budget: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Modul Vendor Hub</p>
                <p className="text-xs text-muted-foreground">Melihat kontak vendor</p>
              </div>
              <Switch
                checked={familyPerms.vendor}
                onCheckedChange={(val) => setFamilyPerms({ ...familyPerms, vendor: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Modul Live Rundown</p>
                <p className="text-xs text-muted-foreground">Melihat susunan acara & aba-aba</p>
              </div>
              <Switch
                checked={familyPerms.rundown}
                onCheckedChange={(val) => setFamilyPerms({ ...familyPerms, rundown: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Modul Daftar Tamu & Meja</p>
                <p className="text-xs text-muted-foreground">Melihat tamu & melakukan check-in</p>
              </div>
              <Switch
                checked={familyPerms.guest}
                onCheckedChange={(val) => setFamilyPerms({ ...familyPerms, guest: val })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Log Kado & Angpao</p>
                <p className="text-xs text-muted-foreground">Pencatatan amplop fisik</p>
              </div>
              <Switch
                checked={familyPerms.gift_log}
                onCheckedChange={(val) => setFamilyPerms({ ...familyPerms, gift_log: val })}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border pt-4">
            <Button onClick={handleSaveTemplates} variant="secondary" className="w-full font-semibold" disabled={loading}>
              {loading ? "Menyimpan ke Database..." : "Simpan Template Keluarga"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
