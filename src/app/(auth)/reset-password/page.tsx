"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast({
        title: "Perhatian",
        description: "Mohon isi kedua kolom kata sandi.",
        variant: "warning",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Kata Sandi Terlalu Pendek",
        description: "Kata sandi minimal harus terdiri dari 6 karakter.",
        variant: "warning",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Kata Sandi Tidak Cocok",
        description: "Konfirmasi kata sandi harus sama dengan kata sandi baru.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast({
          title: "Gagal Mengubah Kata Sandi",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Kata Sandi Berhasil Diperbarui!",
          description: "Kata sandi Anda telah berhasil diubah. Silakan masuk kembali.",
          variant: "success",
        });
        router.push("/login");
        router.refresh();
      }
    } catch {
      toast({
        title: "Kesalahan Server",
        description: "Gagal memperbarui kata sandi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm border-border/70">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1">
          <Lock className="h-6 w-6 text-emerald-500" />
        </div>
        <CardTitle className="text-xl font-semibold">
          Buat Kata Sandi Baru
        </CardTitle>
        <CardDescription>
          Masukkan kata sandi baru yang aman untuk akun NikahYuk Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors rounded"
                title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Konfirmasi Kata Sandi Baru
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors rounded"
                title={showConfirmPassword ? "Sembunyikan Konfirmasi Kata Sandi" : "Tampilkan Konfirmasi Kata Sandi"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <ShieldCheck className="h-4 w-4" />
            {loading ? "Memproses Pembaruan..." : "Simpan Kata Sandi Baru"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-xs text-muted-foreground">
          Sudah ingat kata sandi Anda?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
