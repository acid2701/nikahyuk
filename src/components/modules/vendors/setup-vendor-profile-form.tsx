"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IndonesiaRegionSelect } from "@/components/shared/location/indonesia-region-select";
import { setupVendorProfileForExistingUserAction } from "@/actions/vendor-partner-actions";
import { useToast } from "@/components/ui/use-toast";
import { Building2, ShieldCheck, User, Mail, Phone, CheckCircle2 } from "lucide-react";

interface SetupVendorProfileFormProps {
  userEmail: string;
  defaultPicName: string;
  onSuccess?: () => void;
}

export function SetupVendorProfileForm({
  userEmail,
  defaultPicName,
  onSuccess,
}: SetupVendorProfileFormProps) {
  const [companyName, setCompanyName] = React.useState("");
  const [category, setCategory] = React.useState("Catering");
  const [province, setProvince] = React.useState("DKI Jakarta");
  const [city, setCity] = React.useState("Jakarta Selatan");
  const [picName, setPicName] = React.useState(defaultPicName || "");
  const [phone, setPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName || !city || !picName || !phone) {
      toast({
        title: "Mohon Lengkapi Form",
        description: "Semua kolom bertanda bintang (*) wajib diisi.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await setupVendorProfileForExistingUserAction({
        companyName,
        category,
        city,
        province,
        picName,
        phone,
      });

      if (!res.success) {
        toast({
          title: "Gagal Mengaktifkan Portal Vendor",
          description: res.error || "Gagal menyimpan informasi profil vendor.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Portal Vendor Berhasil Dibuat! 🎉",
        description: `'${companyName}' telah terhubung dengan akun NikahYuk Anda.`,
        variant: "success",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      toast({
        title: "Gagal Mengaktifkan Vendor",
        description: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-xl mx-auto shadow-sm border-border/80 rounded-xl my-8">
      <CardHeader className="space-y-2 text-center bg-muted/20 pb-6 border-b border-border/60">
        <Badge className="w-fit mx-auto bg-amber-500/10 text-amber-600 border-amber-500/30 text-[11px] gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Satu Akun NikahYuk (Single Identity)
        </Badge>
        <CardTitle className="font-serif text-2xl font-bold">
          Lengkapi Informasi Profil Usaha Vendor Anda
        </CardTitle>
        <CardDescription className="text-xs max-w-md mx-auto">
          Akun NikahYuk Anda (<span className="font-semibold text-foreground">{userEmail}</span>) belum terhubung dengan profil usaha vendor. Lengkapi form berikut tanpa perlu daftar ulang!
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nama Brand / Perusahaan Vendor *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g. Berkah Catering Utama / Royal Decoration"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Kategori Layanan *
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Catering">🍱 Catering</SelectItem>
                  <SelectItem value="Venue">🏛️ Venue & Gedung</SelectItem>
                  <SelectItem value="Dekorasi">🌸 Dekorasi</SelectItem>
                  <SelectItem value="MUA & Busana">💄 MUA & Busana</SelectItem>
                  <SelectItem value="Dokumentasi">📷 Dokumentasi</SelectItem>
                  <SelectItem value="Entertainment">🎵 Entertainment</SelectItem>
                  <SelectItem value="Wedding Organizer">📋 Wedding Organizer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama PIC / Owner Usaha *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g. Budi Santoso"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </div>

          {/* INTEGRATED API WILAYAH INDONESIA */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-foreground">
              Wilayah Operasional (Provinsi & Kota/Kabupaten) *
            </label>
            <IndonesiaRegionSelect
              provinceName={province}
              cityName={city}
              onProvinceChange={(name) => setProvince(name)}
              onCityChange={(name) => setCity(name)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nomor WhatsApp Aktif PIC *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="e.g. 081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs h-10 gap-2 mt-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? "Menyimpan Profil..." : "🚀 Simpan & Aktifkan Portal Vendor Saya"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
