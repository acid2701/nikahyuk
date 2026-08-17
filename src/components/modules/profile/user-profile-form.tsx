"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateUserProfileDetailAction } from "@/actions/user-profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Phone, Calendar, Save, ShieldCheck } from "lucide-react";

export interface UserProfileFormProps {
  email: string;
  initialFullName: string;
  initialPhone: string;
  provider: string;
  createdAt: string;
}

export function UserProfileForm({
  email,
  initialFullName,
  initialPhone,
  provider,
  createdAt,
}: UserProfileFormProps) {
  const [fullName, setFullName] = React.useState(initialFullName);
  const [phone, setPhone] = React.useState(initialPhone);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const hasChanges = fullName !== initialFullName || phone !== initialPhone;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      toast({
        title: "Perhatian",
        description: "Nama lengkap tidak boleh kosong.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await updateUserProfileDetailAction({
        fullName: fullName.trim(),
        phone: phone.trim(),
      });

      toast({
        title: "Profil Berhasil Diperbarui",
        description: "Informasi diri Anda telah tersimpan.",
        variant: "success",
      });

      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Menyimpan Profil",
        description: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const formattedDate = new Date(createdAt).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {email.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg font-serif">Detail Informasi Pengguna</CardTitle>
              <CardDescription className="text-xs">
                Kelola nama tampilan dan informasi diri akun Anda.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase gap-1 py-0.5">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            {provider === "google" ? "Google Account" : "Email & Password"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> Alamat Email (Terverifikasi)
              </label>
              <Input
                type="email"
                value={email}
                disabled
                className="bg-muted/40 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Tanggal Bergabung
              </label>
              <Input
                type="text"
                value={formattedDate}
                disabled
                className="bg-muted/40 text-xs"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="user-full-name" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-primary" /> Nama Lengkap / Display Name
              </label>
              <Input
                id="user-full-name"
                type="text"
                placeholder="e.g. Raden Romeo Santoso"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="user-phone" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-primary" /> Nomor WhatsApp / HP
              </label>
              <Input
                id="user-phone"
                type="text"
                placeholder="e.g. 081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading || !hasChanges}
              size="sm"
              className="gap-1.5 h-9 text-xs font-semibold px-4"
            >
              <Save className="h-4 w-4" />
              {loading ? "Menyimpan..." : "Simpan Perubahan Profil"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
