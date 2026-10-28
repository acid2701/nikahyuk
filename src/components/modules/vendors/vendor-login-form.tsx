"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/client";
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
import { Eye, EyeOff, Building2, Lock, Mail } from "lucide-react";

import { loginVendorPartnerAction } from "@/actions/vendor-partner-actions";

export function VendorLoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginVendorPartnerAction(email, password);

      if (!res.success) {
        toast({
          title: "Gagal Masuk Portal Vendor",
          description: res.error || "Email atau kata sandi vendor salah.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Berhasil Masuk Portal Vendor",
        description: "Selamat datang di Dashboard Mandiri Mitra Vendor NikahYuk.",
        variant: "success",
      });

      router.push("/vendor/dashboard");
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Masuk",
        description: err instanceof Error ? err.message : "Terjadi kesalahan koneksi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center bg-muted/20 pb-4 border-b border-border/60">
        <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 mb-1 border border-amber-500/30">
          <Building2 className="h-6 w-6" />
        </div>
        <CardTitle className="font-sans text-2xl font-bold">
          Portal Login Mitra Vendor
        </CardTitle>
        <CardDescription className="text-xs">
          Masuk ke akun vendor Anda untuk mengelola paket penawaran & profil usaha.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Email Vendor
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="vendor@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pl-9 pr-10"
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

          <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs h-10" disabled={loading}>
            {loading ? "Memproses..." : "Masuk ke Dashboard Vendor"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2 justify-center border-t border-border/60 py-3 bg-muted/20">
        <p className="text-xs text-muted-foreground">
          Belum terdaftar sebagai vendor?{" "}
          <Link href="/vendor-register" className="text-foreground font-semibold hover:underline">
            Daftar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
