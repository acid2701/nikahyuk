"use client";

import * as React from "react";
import { changeUserPasswordAction } from "@/actions/user-profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";

export interface ChangePasswordFormProps {
  isOAuthUser?: boolean;
}

export function ChangePasswordForm({ isOAuthUser }: ChangePasswordFormProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: "Kata Sandi Terlalu Pendek",
        description: "Kata sandi baru harus minimal 6 karakter.",
        variant: "warning",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Konfirmasi Tidak Cocok",
        description: "Konfirmasi kata sandi baru tidak sesuai.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await changeUserPasswordAction(newPassword);

      toast({
        title: "Kata Sandi Berhasil Diperbarui",
        description: "Kata sandi akun Anda telah diperbarui.",
        variant: "success",
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast({
        title: "Gagal Mengubah Kata Sandi",
        description: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (isOAuthUser) {
    return (
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" /> Keamanan & Kata Sandi
          </CardTitle>
          <CardDescription className="text-xs">
            Pengaturan kata sandi untuk akun terdaftar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg p-4 bg-secondary/40 border border-border/80 flex items-start space-x-3 text-xs">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Akun Terhubung via Google OAuth</p>
              <p className="text-muted-foreground leading-relaxed">
                Anda masuk menggunakan akun Google. Otentikasi dan keamanan kata sandi dikelola secara langsung oleh Google.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" /> Keamanan & Kata Sandi
        </CardTitle>
        <CardDescription className="text-xs">
          Perbarui kata sandi akun Anda untuk menjaga keamanan data pernikahan.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="new-pass" className="text-xs font-semibold text-foreground">
                Kata Sandi Baru
              </label>
              <Input
                id="new-pass"
                type="password"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-pass" className="text-xs font-semibold text-foreground">
                Konfirmasi Kata Sandi Baru
              </label>
              <Input
                id="confirm-pass"
                type="password"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              size="sm"
              className="gap-1.5 h-9 text-xs font-semibold px-4"
            >
              <CheckCircle2 className="h-4 w-4" />
              {loading ? "Memperbarui..." : "Perbarui Kata Sandi"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
