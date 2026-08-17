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

  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  async function handleSaveTemplates() {
    setLoading(true);
    try {
      toast({
        title: "Template RBAC Disimpan",
        description: "Standar hak akses default global berhasil diperbarui.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat memperbarui template.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Master Template Hak Akses (RBAC Defaults)
        </h2>
        <p className="text-sm text-muted-foreground">
          Atur matriks izin bawaan global untuk Wedding Organizer (WO) dan Panitia Keluarga.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Default Izin: Wedding Organizer (WO)
            </CardTitle>
            <CardDescription>
              Izin bawaan saat pasangan mengundang tim WO.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          <CardFooter>
            <Button onClick={handleSaveTemplates} className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Template WO"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Default Izin: Panitia Keluarga
            </CardTitle>
            <CardDescription>
              Izin bawaan untuk keluarga dan penerima tamu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          <CardFooter>
            <Button onClick={handleSaveTemplates} variant="secondary" className="w-full" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Template Keluarga"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
