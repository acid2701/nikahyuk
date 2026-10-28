"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AccountTypeToggle } from "@/components/shared/auth/account-type-toggle";
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
import {
  Building2,
  CheckCircle2,
  Send,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Store,
  Layers,
  MapPin,
  ArrowRight,
  HelpCircle,
  ListOrdered,
} from "lucide-react";

interface PublicVendorRegistrationFormProps {
  appName?: string;
  logoUrl?: string;
}

export function PublicVendorRegistrationForm({
  appName = "NikahYuk",
  logoUrl,
}: PublicVendorRegistrationFormProps) {
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

    if (!companyName.trim()) {
      toast({
        title: "Nama Brand Wajib Diisi",
        description: "Silakan masukkan nama usaha atau brand vendor Anda.",
        variant: "destructive",
      });
      return;
    }

    if (!province || !city) {
      toast({
        title: "Provinsi & Kota Wajib Dipilih",
        description: "Silakan pilih provinsi dan kota/kabupaten operasional usaha Anda dari dropdown.",
        variant: "destructive",
      });
      return;
    }

    if (!picName.trim()) {
      toast({
        title: "Nama PIC Wajib Diisi",
        description: "Silakan masukkan nama penanggung jawab atau pemilik usaha.",
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

    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Email Tidak Valid",
        description: "Silakan isi alamat email aktif untuk akun login vendor.",
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
        companyName: companyName.trim(),
        category,
        city,
        province,
        picName: picName.trim(),
        phone,
        email: email.trim().toLowerCase(),
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
        description: "Akun mitra vendor Anda telah terdaftar. Silakan login ke portal vendor.",
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
      <Card className="border-border/80 bg-card/90 backdrop-blur-sm max-w-xl mx-auto p-6 sm:p-10 text-center space-y-6 shadow-sm rounded-xl">
        <div className="mx-auto h-16 w-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 animate-in zoom-in duration-300">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs px-3 py-1">
            Status: Terdaftar & Siap Masuk
          </Badge>
          <h2 className="font-sans text-2xl sm:text-3xl font-bold text-foreground">
            Pendaftaran Berhasil Terkirim!
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Selamat, akun vendor <span className="font-semibold text-foreground">{companyName}</span> ({category}) telah dibuat.
          </p>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground text-left space-y-1.5 max-w-md mx-auto">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <ListOrdered className="h-3.5 w-3.5 text-primary" /> Langkah Selanjutnya:
            </p>
            <p>1. Masuk ke Portal Vendor dengan email <span className="font-mono text-foreground font-medium">{email}</span></p>
            <p>2. Unggah logo resmi dan portofolio brosur digital Anda</p>
            <p>3. Buat paket harga penawaran untuk calon pengantin</p>
          </div>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="w-full sm:w-auto text-sm font-semibold gap-2 shadow-sm">
            <Link href="/login">
              Masuk ke Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-sm">
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur-sm shadow-sm max-w-2xl w-full mx-auto rounded-2xl overflow-hidden transition-all">
      <CardHeader className="pb-5 pt-6 px-5 sm:px-8 border-b border-border/60 bg-muted/10 space-y-3">
        {/* Reusable Account Type Pill Toggle */}
        <AccountTypeToggle activeTab="vendor" />

        <div className="text-center space-y-1">
          <CardTitle className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Daftar Akun Mitra Vendor
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Daftarkan layanan pernikahan Anda untuk menjangkau calon pasangan pengantin.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Profil Usaha */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold">1</span>
                Profil Usaha & Layanan Pernikahan
              </h3>
              <span className="text-[11px] text-muted-foreground italic">* Wajib diisi</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5 text-muted-foreground" /> Nama Brand / Usaha Vendor *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Royal Wedding Decor & Catering"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-10 text-sm"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Nama brand komersial yang akan tampil di katalog calon pengantin.
                </p>
              </div>

              <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" /> Kategori Layanan Utama *
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 text-sm w-full">
                    <SelectValue placeholder="Pilih Kategori Layanan..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem value="Catering">🍱 Catering & Makanan</SelectItem>
                    <SelectItem value="Venue">🏛️ Venue & Gedung Pernikahan</SelectItem>
                    <SelectItem value="Dekorasi">🌸 Dekorasi & Pelaminan</SelectItem>
                    <SelectItem value="MUA & Busana">💄 MUA, Gaun & Busana Pengantin</SelectItem>
                    <SelectItem value="Dokumentasi">📷 Foto & Video Dokumentasi</SelectItem>
                    <SelectItem value="Entertainment">🎵 Music, Sound & Entertainment</SelectItem>
                    <SelectItem value="Wedding Organizer">📋 Wedding Organizer (WO / Planner)</SelectItem>
                    <SelectItem value="Undangan & Souvenir">💌 Undangan & Souvenir Pernikahan</SelectItem>
                    <SelectItem value="Kue & Hantaran">🎂 Kue Pernikahan & Hantaran</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Kategori utama jasa Anda untuk mempermudah filter pencarian.
                </p>
              </div>
            </div>

            {/* Indonesia Region Cascading API */}
            <div className="pt-1">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5 mb-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Wilayah Operasional Usaha *
              </label>
              <IndonesiaRegionSelect
                provinceName={province}
                cityName={city}
                onProvinceChange={setProvince}
                onCityChange={setCity}
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Pilih cakupan provinsi dan kota domisili usaha Anda di Indonesia.
              </p>
            </div>
          </div>

          {/* Section 2: Kontak & Kredensial Akses */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 text-xs font-bold">2</span>
                Kontak PIC & Kredensial Login Portal
              </h3>
              <span className="text-[11px] text-muted-foreground italic">* Terenkripsi aman</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" /> Nama PIC / Penanggung Jawab *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Bpk. Hendra Gunawan"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                  className="h-10 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  Nomor WhatsApp Aktif PIC *
                </label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  placeholder="081234567890"
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Akun Login *
                </label>
                <Input
                  type="email"
                  placeholder="admin@vendoranda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 text-sm"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Digunakan untuk masuk ke Portal Dashboard Vendor.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Kata Sandi (Password) *
                </label>
                <Input
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 text-sm"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Gunakan kombinasi huruf & angka yang kuat.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Value Summary & Submit Bar */}
          <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-2 max-w-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-normal">
                Dengan mendaftar, Anda menyetujui standar etika layanan mitra {appName} dan menjaga transparansi harga kepada calon pengantin.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full sm:w-auto h-11 px-8 gap-2 font-semibold shadow-xs shrink-0 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41]"
            >
              <Send className="h-4 w-4" />
              {loading ? "Mendaftarkan Mitra..." : "Daftar Mitra Vendor Sekarang"}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2 justify-center border-t border-border/60 py-4 px-5 sm:px-8 bg-muted/10 text-center">
        <p className="text-xs text-muted-foreground">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="text-foreground font-semibold hover:underline">
            Masuk
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
