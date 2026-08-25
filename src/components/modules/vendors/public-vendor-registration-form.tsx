"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/shared/whatsapp/phone-input";
import { IndonesiaRegionSelect } from "@/components/shared/location/indonesia-region-select";
import { registerVendorPartnerAction } from "@/actions/vendor-partner-actions";
import { useToast } from "@/components/ui/use-toast";
import { Building2, CheckCircle2, Sparkles, Send, Lock, Mail, User, ShieldCheck } from "lucide-react";

export function PublicVendorRegistrationForm() {
  const [companyName, setCompanyName] = React.useState("");
  const [category, setCategory] = React.useState("Catering");
  const [city, setCity] = React.useState("");
  const [province, setProvince] = React.useState("");
  const [picName, setPicName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!province || !city) {
      toast({
        title: "Provinsi & Kota Wajib Dipilih",
        description: "Silakan pilih provinsi dan kota/kabupaten operasional usaha Anda dari dropdown.",
        variant: "destructive",
      });
      return;
    }

    if (!phone) {
      toast({
        title: "Nomor WhatsApp Wajib Diisi",
        description: "Silakan isi nomor WhatsApp aktif PIC usaha Anda.",
        variant: "destructive",
      });
      return;
    }

    if (!password || password.length < 6) {
      toast({
        title: "Kata Sandi Kurang Panjang",
        description: "Kata sandi minimal 6 karakter untuk keamanan login akun Anda.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await registerVendorPartnerAction({
        companyName,
        category,
        city,
        province,
        picName,
        phone,
        email,
        password,
      });

      if (!res.success) {
        toast({
          title: "Gagal Mengirim Pendaftaran",
          description: res.error || "Gagal mendaftarkan mitra vendor.",
          variant: "destructive",
        });
        return;
      }

      setSubmitted(true);
      toast({
        title: "Pendaftaran Berhasil!",
        description: "Akun mitra vendor Anda telah terdaftar. Tim Admin akan memverifikasi profil usaha Anda.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Mengirim Pendaftaran",
        description: err instanceof Error ? err.message : "Terjadi kesalahan koneksi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Card className="border-emerald-500/40 bg-emerald-500/5 max-w-lg mx-auto p-8 text-center space-y-4 shadow-lg">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Pendaftaran Berhasil Terkirim!
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Selamat, akun vendor <span className="font-semibold text-foreground">{companyName}</span> telah berhasil dibuat.
          </p>
          <p className="text-xs text-muted-foreground">
            Setelah disetujui Admin, Anda dapat masuk ke Portal Vendor untuk melengkapi brosur R2, logo, dan menambahkan paket penawaran interaktif.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild className="text-xs font-semibold">
            <Link href="/vendor/login">Masuk ke Portal Dashboard Vendor →</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-md max-w-xl mx-auto">
      <CardHeader className="text-center pb-4 border-b border-border/60 bg-muted/20">
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 mx-auto text-[11px] mb-1">
          Kemitraan Vendor Pernikahan NikahYuk
        </Badge>
        <CardTitle className="font-serif text-2xl font-bold">
          Daftar Mitra Vendor Pernikahan
        </CardTitle>
        <CardDescription className="text-xs max-w-md mx-auto">
          Proses cepat 30 detik. Promosikan jasa pernikahan Anda ke ribuan calon pasangan pengantin di Indonesia.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Profil Usaha */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-primary" /> 1. Profil Perusahaan / Usaha
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Nama Brand Vendor *</label>
                <Input
                  type="text"
                  placeholder="e.g. Berkah Catering Utama"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Kategori Layanan *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Pilih Kategori..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Catering">🍱 Catering & Makanan</SelectItem>
                    <SelectItem value="Venue">🏛️ Venue & Gedung</SelectItem>
                    <SelectItem value="Dekorasi">🌸 Dekorasi Acara</SelectItem>
                    <SelectItem value="MUA & Busana">💄 MUA & Busana Pengantin</SelectItem>
                    <SelectItem value="Dokumentasi">📷 Foto & Video Dokumentasi</SelectItem>
                    <SelectItem value="Entertainment">🎵 Music & Entertainment</SelectItem>
                    <SelectItem value="Wedding Organizer">📋 Wedding Organizer (WO)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Indonesia Region API Select */}
            <IndonesiaRegionSelect
              provinceName={province}
              cityName={city}
              onProvinceChange={setProvince}
              onCityChange={setCity}
            />
          </div>

          {/* Section 2: Kontak & Kredensial Login */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> 2. Kontak PIC & Kredensial Login
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Nama PIC / Penanggung Jawab *</label>
                <Input
                  type="text"
                  placeholder="e.g. Ibu Rita Suwandi"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Nomor WhatsApp Aktif *</label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  placeholder="081234567890"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Email Akun Login *</label>
                <Input
                  type="email"
                  placeholder="vendor@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Kata Sandi (Password) *</label>
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground italic">
              * Detail paket & brosur R2 dilengkapi di Dashboard Vendor.
            </p>
            <Button type="submit" disabled={loading} className="gap-2 text-xs font-semibold px-6 bg-amber-500 hover:bg-amber-600 text-white">
              <Send className="h-4 w-4" />
              {loading ? "Mendaftarkan..." : "Daftar Mitra Vendor (30 Detik)"}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t border-border/60 py-3 bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Sudah memiliki akun vendor?{" "}
          <Link href="/vendor/login" className="text-primary font-semibold hover:underline">
            Masuk ke Portal Vendor
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
